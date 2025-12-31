import { IsNumber, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsNumber()
  marketGoldRate?: number;

  @IsOptional()
  @IsNumber()
  bankGoldRate?: number;

  @IsOptional()
  @IsNumber()
  defaultRetentionPercent?: number;
}
