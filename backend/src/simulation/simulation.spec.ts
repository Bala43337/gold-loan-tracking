import { Test, TestingModule } from '@nestjs/testing';
import { SimulationService } from './simulation.service';
import { LoansService } from '../loans/loans.service';

const mockLoans = [
  {
    _id: 'loanA',
    loanName: 'Big Loan',
    principalAmount: 500000,
    annualInterestRate: 12,
    goldGrams: 100,
    status: 'ACTIVE',
    currentTotalDue: 510000, // Accumulated interest
  },
  {
    _id: 'loanB',
    loanName: 'Small Loan',
    principalAmount: 50000,
    annualInterestRate: 12,
    goldGrams: 10,
    status: 'ACTIVE',
    currentTotalDue: 51000,
  },
];

describe('SimulationService Verification', () => {
  let service: SimulationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationService,
        {
          provide: LoansService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockLoans),
          },
        },
      ],
    }).compile();

    service = module.get<SimulationService>(SimulationService);
  });

  it('should close small loan and re-loan to accumulate cash', async () => {
    // Cash: 60k.
    // Can close Small Loan (51k). Remaining 9k.
    // Re-loan Small Loan (10g). Retention 10%. Effective 9g.
    // Bank Rate 6000. New Loan = 9 * 6000 = 54k.
    // Total Cash = 9k + 54k = 63k.
    // Checks Big Loan (510k). Cannot close.
    // Stops.

    const result = await service.simulateClosure({
      availableCash: 60000,
      bankGoldRate: 6000,
      retentionPercent: 10,
    });

    console.log('Steps:', JSON.stringify(result.steps, null, 2));

    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0].action).toBe('REDEEM'); // Closed Small
    expect(result.steps[0].loanName).toBe('Small Loan');

    // Check re-loan
    // Since we still have active loans (Big Loan), it should attempt re-loan
    const reloanStep = result.steps.find((s) => s.action === 'RELOAN');
    expect(reloanStep).toBeDefined();
    expect(reloanStep.amountGenerated).toBe(54000); // 10g * 0.9 * 6000

    expect(result.totalGoldRecovered).toBe(0); // Because we re-loaned it
    expect(result.remainingLoans).toBe(1); // Big Loan remaining. Small was closed. Re-loan is new but not in original list.

    // My code logic:
    // It filters "simulatedStatus === 'ACTIVE'".
    // The loop changes status to CLOSED.
    // But it doesn't add the "New Re-Loan" to the array of loans to be closed. It just generates cash.
    // So "remainingLoans" should be 1 (Big Loan).

    // Wait, if I re-loan, I technically have a new loan.
    // The simulation treats "Recovered Gold" as just "Cash Source" if needed.
    // The goal is to minimize "Existing Bad Loans".
  });
});
