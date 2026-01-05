import { Injectable } from "@nestjs/common";
import { LoansService } from "../loans/loans.service";
import { SimulateLoanClosureDto } from "./dto/simulate-loan-closure.dto";
import { Loan } from "../loans/schemas/loan.schema";

@Injectable()
export class SimulationService {
  constructor(private readonly loansService: LoansService) {}

  async simulateClosure(dto: SimulateLoanClosureDto) {
    // 1. Fetch all ACTIVE loans
    const allLoans = await this.loansService.findAll();
    const activeLoans = allLoans.filter((l) => l.status === "ACTIVE");

    let currentCash = dto.availableCash;
    const { bankGoldRate, retentionPercent } = dto;

    const steps = [];
    let goldInHand = 0; // Recovered gold that is currently FREE (not re-pledged)

    // Deep copy for simulation state
    let loansState = activeLoans.map((l) => ({
      ...l,
      simulatedStatus: "ACTIVE",
    }));

    let canProceed = true;

    while (canProceed) {
      canProceed = false;

      // Sort by highest interest burden (Principal * Rate)
      loansState.sort((a, b) => {
        const burdenA = a.principalAmount * a.annualInterestRate;
        const burdenB = b.principalAmount * b.annualInterestRate;
        return burdenB - burdenA; // Descending
      });

      // Strategy: Use Cash -> Close Biggest Burden -> Get Gold -> Re-loan ONLY if needed for NEXT Biggest

      // 1. Attempt to close loans with current cash (Priority: Highest Burden)
      // Since we sorted by burden, we try to close them in order.
      // If we can't close the biggest, logic says we might need to re-loan to get enough cash.
      // But first, let's see if we can close *any* loan to get its gold?
      // Actually, standard avalanche implies attacking the head.
      // If we have 50k and top loan is 100k, we can't close it.
      // Do we have goldInHand? If yes, re-loan it to get cash.
      // If no, check if we can close smaller loans to get their gold?
      // The user wants "Recycle". Usually implies closing what you CAN to generate resources for the big ones.

      // Adjusted Strategy:
      // 1. Check if we can close the TOP burden loan.
      // 2. If yes, close it. Add gold to Hand. Loop.
      // 3. If no, check if we currently have goldInHand.
      //    - If yes, re-loan PARTIAL/FULL goldInHand enough to match the deficit.
      //    - If we assume standard bank rate for new loans.
      // 4. If no goldInHand, scan list for ANY loan we can close with currentCash to free up gold?
      //    - If yes, close that smaller one. Add gold to Hand. Loop.
      // 5. If nothing closes and no gold to re-loan, STOP.

      // Let's implement this loop.

      // Finds the highest priority loan we WANT to close (The top active one)
      const topLoanIndex = loansState.findIndex(
        (l) => l.simulatedStatus === "ACTIVE"
      );

      if (topLoanIndex === -1) break; // All done

      const topLoan = loansState[topLoanIndex];

      if (currentCash >= topLoan.currentTotalDue) {
        // We can close the top priority loan directly!
        currentCash -= topLoan.currentTotalDue;
        topLoan.simulatedStatus = "CLOSED";
        goldInHand += topLoan.goldGrams;

        steps.push({
          action: "REDEEM",
          loanId: topLoan._id,
          loanName: topLoan.loanName,
          amountUsed: topLoan.currentTotalDue,
          goldGrams: topLoan.goldGrams,
          description: `Closed loan '${topLoan.loanName}' using cash. recovered ${topLoan.goldGrams}g gold.`,
        });
        canProceed = true;
      } else {
        // We cannot close the top loan.
        const deficit = topLoan.currentTotalDue - currentCash;

        // Can we cover deficit with goldInHand?
        // CashGenerated = PledgedGold * Rate
        // PledgedGold = CashNeeded / Rate
        // Effective Rate includes retention?
        // Logic: You pledge G grams. Bank values at Rate. Keeps Retention%. gives you X.
        // X = G * Rate * (1 - retention/100)
        // So G_needed = X / (Rate * (1 - retention/100))

        const effectiveRate = bankGoldRate * (1 - retentionPercent / 100);
        const goldNeeded = deficit / effectiveRate;

        if (goldInHand > 0) {
          // We have some gold.
          const goldToPledge = Math.min(goldInHand, goldNeeded);
          const cashGenerated = goldToPledge * effectiveRate;

          currentCash += cashGenerated;
          goldInHand -= goldToPledge;

          steps.push({
            action: "RELOAN",
            generatedFromLoanId: "POOL", // Abstract pool
            goldGrams: goldToPledge,
            amountGenerated: cashGenerated,
            description: `Re-loaned ${goldToPledge.toFixed(2)}g from saved gold to generate ${cashGenerated.toFixed(2)} cash.`,
          });

          canProceed = true; // Loop to try closing topLoan again (now we have more cash)
        } else {
          // No gold in hand. Can we close a SMALLER loan to get gold?
          // Find first loan (starting from index 1, since 0 is top) that fits in cash
          const smallLoanIndex = loansState.findIndex(
            (l) =>
              l.simulatedStatus === "ACTIVE" && l.currentTotalDue <= currentCash
          );

          if (smallLoanIndex !== -1) {
            const smallLoan = loansState[smallLoanIndex];
            currentCash -= smallLoan.currentTotalDue;
            smallLoan.simulatedStatus = "CLOSED";
            goldInHand += smallLoan.goldGrams;

            steps.push({
              action: "REDEEM",
              loanId: smallLoan._id,
              loanName: smallLoan.loanName,
              amountUsed: smallLoan.currentTotalDue,
              goldGrams: smallLoan.goldGrams,
              description: `Closed smaller loan '${smallLoan.loanName}' to release gold.`,
            });
            canProceed = true;
          } else {
            // Stuck. Cannot close top loan, no gold to re-loan, no smaller loan to close.
            canProceed = false;
          }
        }
      }
    }

    const remainingLoansCount = loansState.filter(
      (l) => l.simulatedStatus === "ACTIVE"
    ).length;

    return {
      steps,
      totalGoldRecovered: goldInHand, // This is exactly what user wants: "saved gold"
      remainingLoans: remainingLoansCount,
      suggestion:
        remainingLoansCount === 0
          ? "You can become debt free!"
          : "Follow these steps to reduce burden.",
    };
  }
}
