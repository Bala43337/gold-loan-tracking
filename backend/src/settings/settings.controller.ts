import { Controller, Get, Patch, Body, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(updateSettingsDto);
  }

  @Post('fetch-live')
  async fetchLiveRate() {
    const rate = await this.settingsService.fetchLiveGoldRate();
    return { marketGoldRate: rate };
  }
}
