import { Controller, Post, Body } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { SimulateLoanClosureDto } from './dto/simulate-loan-closure.dto';

@Controller('simulate')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post('loan-closure')
  simulateClosure(@Body() dto: SimulateLoanClosureDto) {
    return this.simulationService.simulateClosure(dto);
  }
}
