export interface Loan {
  _id: string;
  loanName: string;
  startDate: string;
  endDate?: string;
  principalAmount: number;
  annualInterestRate: number;
  goldGrams: number;
  bankAcceptedRate: number;
  bankRetentionPercent: number;
  billImageBase64?: string;
  status: "ACTIVE" | "CLOSED";

  // Enriched fields
  interestTillDate?: number;
  daysPassed?: number;
  currentTotalDue?: number;
}

export interface AppSettings {
  marketGoldRate: number;
  bankGoldRate: number;
  defaultRetentionPercent: number;
  lastUpdated: string;
}

export type CreateLoanDto = Omit<
  Loan,
  "_id" | "interestTillDate" | "daysPassed" | "currentTotalDue"
>;
