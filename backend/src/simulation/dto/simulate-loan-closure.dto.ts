import { IsNumber } from 'class-validator';

export class SimulateLoanClosureDto {
  @IsNumber()
  availableCash: number;

  @IsNumber()
  bankGoldRate: number; // Current rate offered by bank for new loans

  @IsNumber()
  retentionPercent: number; // e.g., 10 for 10%
}
