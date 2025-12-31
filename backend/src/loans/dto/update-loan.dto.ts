import { PartialType } from '@nestjs/mapped-types';
import { CreateLoanDto } from './create-loan.dto';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateLoanDto extends PartialType(CreateLoanDto) {
  @IsOptional()
  @IsEnum(['ACTIVE', 'CLOSED'])
  status?: string;
}
