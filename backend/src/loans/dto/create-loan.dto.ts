import {
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  IsBase64,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLoanDto {
  @IsString()
  loanName: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsNumber()
  principalAmount: number;

  @IsNumber()
  annualInterestRate: number;

  @IsNumber()
  goldGrams: number;

  @IsNumber()
  bankAcceptedRate: number;

  @IsNumber()
  bankRetentionPercent: number;

  @IsOptional()
  @IsString()
  billImageBase64?: string;
}
