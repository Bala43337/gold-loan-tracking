import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Loan, LoanDocument } from './schemas/loan.schema';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import dayjs from 'dayjs';

@Injectable()
export class LoansService {
  constructor(@InjectModel(Loan.name) private loanModel: Model<LoanDocument>) {}

  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    const createdLoan = new this.loanModel(createLoanDto);
    return createdLoan.save();
  }

  async findAll(): Promise<any[]> {
    const loans = await this.loanModel.find().exec();
    return loans.map((loan) => this.enrichLoanWithInterest(loan));
  }

  async findOne(id: string): Promise<any> {
    const loan = await this.loanModel.findById(id).exec();
    if (!loan) {
      throw new NotFoundException(`Loan #${id} not found`);
    }
    return this.enrichLoanWithInterest(loan);
  }

  async update(id: string, updateLoanDto: UpdateLoanDto): Promise<Loan> {
    const existingLoan = await this.loanModel
      .findByIdAndUpdate(id, updateLoanDto, { new: true })
      .exec();
    if (!existingLoan) {
      throw new NotFoundException(`Loan #${id} not found`);
    }
    return existingLoan;
  }

  async remove(id: string): Promise<Loan> {
    const deletedLoan = await this.loanModel.findByIdAndDelete(id).exec();
    if (!deletedLoan) {
      throw new NotFoundException(`Loan #${id} not found`);
    }
    return deletedLoan;
  }

  private enrichLoanWithInterest(loan: LoanDocument): any {
    const loanObj = loan.toObject();

    // Core Business Rule: Interest Calculation
    // Interest = Principal * (AnnualRate / 100) * (DaysPassed / 365)

    const startDate = dayjs(loan.startDate);
    const today = dayjs();
    const daysPassed = today.diff(startDate, 'day');

    // Use Math.max(0, daysPassed) to avoid negative interest if start date is future (unlikely but safe)
    // If loan is closed, we technically should stop interest at endDate, but for now assuming active:
    // TODO: If CLOSED, use endDate for calculation.

    const calculationDate =
      loan.status === 'CLOSED' && loan.endDate ? dayjs(loan.endDate) : today;

    const effectiveDays = Math.max(0, calculationDate.diff(startDate, 'day'));

    const interestAmount =
      loan.principalAmount *
      (loan.annualInterestRate / 100) *
      (effectiveDays / 365);

    return {
      ...loanObj,
      interestTillDate: parseFloat(interestAmount.toFixed(2)),
      daysPassed: effectiveDays,
      currentTotalDue: parseFloat(
        (loan.principalAmount + interestAmount).toFixed(2),
      ),
    };
  }
}
