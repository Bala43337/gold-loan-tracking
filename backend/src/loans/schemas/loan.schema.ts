import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LoanDocument = Loan & Document;

@Schema({ timestamps: true })
export class Loan {
  @Prop({ required: true })
  loanName: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate: Date; // Optional, only if has specific end date or closed

  @Prop({ required: true })
  principalAmount: number;

  @Prop({ required: true })
  annualInterestRate: number;

  @Prop({ required: true })
  goldGrams: number;

  @Prop({ required: true })
  bankAcceptedRate: number; // Rate per gram when loan was taken

  @Prop({ required: true })
  bankRetentionPercent: number; // e.g. 10% (kept by bank margin)

  @Prop()
  billImageBase64: string;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'CLOSED'] })
  status: string;
}

export const LoanSchema = SchemaFactory.createForClass(Loan);
