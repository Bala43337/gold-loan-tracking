import { Injectable } from '@nestjs/common';
import { LoansService } from '../loans/loans.service';
import { SimulateLoanClosureDto } from './dto/simulate-loan-closure.dto';
import { Loan } from '../loans/schemas/loan.schema';

@Injectable()
export class SimulationService {
  constructor(private readonly loansService: LoansService) {}

  async simulateClosure(dto: SimulateLoanClosureDto) {
    // 1. Fetch all ACTIVE loans
    const allLoans = await this.loansService.findAll();
    const activeLoans = allLoans.filter((l) => l.status === 'ACTIVE');

    let currentCash = dto.availableCash;
    const { bankGoldRate, retentionPercent } = dto;

    const steps = [];
    let totalGoldRecovered = 0; // Purely recovered gold (not re-loaned)
    let totalInterestSaved = 0; // Approximate future saving (simple heuristic)

    // Deep copy for simulation state
    let loansState = activeLoans.map((l) => ({
      ...l,
      simulatedStatus: 'ACTIVE',
    }));

    let canProceed = true;

    while (canProceed) {
      canProceed = false;

      // Sort by highest interest cost (Principal * Rate or just Rate? Usually Rate is key, but large Principal * Rate = high bleeding)
      // "Sort by highest interest burden" -> Usually means absolute interest outflow per day
      // Burden = Principal * Rate
      loansState.sort((a, b) => {
        const burdenA = a.principalAmount * a.annualInterestRate;
        const burdenB = b.principalAmount * b.annualInterestRate;
        return burdenB - burdenA; // Descending
      });

      // Strategy: Try to close the biggest burden loan using cash + potential re-loans
      // If we can't close the biggest, can we close the SMALLEST to free up gold?

      // Let's iterate and see what we can close directly
      const closableLoanIndex = loansState.findIndex(
        (l) =>
          l.simulatedStatus === 'ACTIVE' && l.currentTotalDue <= currentCash,
      );

      if (closableLoanIndex !== -1) {
        // ACTION: REDEEM (Close with Cash)
        const loanToClose = loansState[closableLoanIndex];
        currentCash -= loanToClose.currentTotalDue;
        loanToClose.simulatedStatus = 'CLOSED';

        // Now we have free gold!
        // Should we keep it or re-loan it?
        // Logic: "Attempt to close next biggest loan". If we still have big loans, we might need more cash.
        // So we Re-loan this gold immediately to get more cash to attack the big one.

        // Check if there are still active loans
        const remainingLoans = loansState.filter(
          (l) => l.simulatedStatus === 'ACTIVE',
        );
        if (remainingLoans.length > 0) {
          // RE-LOAN Logic
          // EffectiveGold = GoldGrams * (1 - retentionPercent / 100)
          // NewLoanAmount = EffectiveGold * bankGoldRate

          const effectiveGold =
            loanToClose.goldGrams * (1 - retentionPercent / 100);
          const newLoanAmount = effectiveGold * bankGoldRate;

          // Heuristic: Only re-loan if it helps close another loan that has HIGHER interest rate than the new loan we'd be taking?
          // Assuming new loan interest rate is standard bank rate. But we don't know the new rate.
          // Project spec says: "Redeem smallest or highest-interest loan -> Re-loan redeemed gold -> Combine generated loan + cash -> Attempt to close next biggest loan"
          // It implies an aggressive strategy to cycle gold to close high-interest debt.

          steps.push({
            action: 'REDEEM',
            loanId: loanToClose._id,
            loanName: loanToClose.loanName,
            amountUsed: loanToClose.currentTotalDue,
            description: `Closed loan '${loanToClose.loanName}' using cash.`,
          });

          currentCash += newLoanAmount;

          steps.push({
            action: 'RELOAN',
            generatedFromLoanId: loanToClose._id,
            goldGrams: loanToClose.goldGrams,
            amountGenerated: newLoanAmount,
            description: `Re-loaned ${loanToClose.goldGrams}g gold from '${loanToClose.loanName}' to generate ${newLoanAmount.toFixed(2)} cash.`,
          });

          canProceed = true; // We changed state (got more cash), so loop again to see if we can kill the big boss
        } else {
          // No more loans! We are done.
          steps.push({
            action: 'REDEEM',
            loanId: loanToClose._id,
            loanName: loanToClose.loanName,
            amountUsed: loanToClose.currentTotalDue,
            description: `Closed final loan '${loanToClose.loanName}'.`,
          });
          totalGoldRecovered += loanToClose.goldGrams;
        }
      } else {
        // We cannot close any loan with current cash directly.
        // Can we PARTIAL close? "Determine how fast and profitably loans can be closed using Partial cash"
        // But typical Gold Loans don't release partial gold (usually).
        // If we can't close ANY loan, we are stuck with this strategy unless we just save cash.
        // Wait, "Redeem smallest...". If we can't close ANY, maybe we didn't start with enough cash.
        // Or maybe we should close the smallest one first?
        // We already sorted by BURDEN (Big loans first).
        // Let's finding the smallest amount loan if we can't close the big one.
        // Find distinct smallest loan that fits in cash
        // Actually, my findIndex above finds the FIRST one that fits.
        // If I sorted by Burden, the big ones are first. It skips them if cash < due.
        // Eventually it checks small ones.
        // If closableLoanIndex is still -1, it means currentCash < SMALLEST loan's due.
        // STOP.
      }
    }

    const remainingLoansCount = loansState.filter(
      (l) => l.simulatedStatus === 'ACTIVE',
    ).length;

    return {
      steps,
      totalGoldRecovered, // Only finalized recovered gold showing in hand
      remainingLoans: remainingLoansCount,
      suggestion:
        remainingLoansCount === 0
          ? 'You can become debt free!'
          : 'Follow these steps to reduce burden.',
    };
  }
}
