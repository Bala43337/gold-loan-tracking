import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppSettings, SettingsDocument } from './schemas/settings.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import axios from 'axios';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectModel(AppSettings.name)
    private settingsModel: Model<SettingsDocument>,
  ) {}

  async onModuleInit() {
    // Ensure one settings document exists
    const count = await this.settingsModel.countDocuments();
    if (count === 0) {
      await this.settingsModel.create({
        marketGoldRate: 6000, // Dummy initial
        bankGoldRate: 5400,
        defaultRetentionPercent: 10,
        lastUpdated: new Date(),
      });
    }
  }

  async getSettings(): Promise<AppSettings> {
    const settings = await this.settingsModel.findOne().exec();
    if (!settings) throw new Error('Settings not initialized');
    return settings;
  }

  async updateSettings(
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<AppSettings> {
    const updatedSettings = await this.settingsModel
      .findOneAndUpdate(
        {},
        {
          ...updateSettingsDto,
          lastUpdated: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updatedSettings) throw new Error('Settings not found');
    return updatedSettings;
  }

  async fetchLiveGoldRate(): Promise<number> {
    try {
      // Source: GoldPrice.org Data API
      // Returns XAU (1 Troy Ounce) in INR
      const response = await axios.get(
        'https://data-asg.goldprice.org/dbXRates/INR',
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        },
      );

      if (
        response.data &&
        response.data.items &&
        response.data.items.length > 0
      ) {
        const item = response.data.items[0];
        const xauPriceInr = item.xauPrice; // Price for 1 Troy Ounce (31.1034768 grams) of 24k gold

        // Calculate 24k price per gram
        const pricePerGram24k = xauPriceInr / 31.1034768;

        // Calculate 22k price per gram (Standard for loans/jewelry)
        // 22/24 = 0.9166666...
        const pricePerGram22k = pricePerGram24k * (22 / 24);

        // Round to 2 decimal places
        const finalRate = Math.round(pricePerGram22k * 100) / 100;

        // Update DB
        await this.updateSettings({ marketGoldRate: finalRate });

        return finalRate;
      }

      throw new Error('Invalid data format from API');
    } catch (error) {
      console.error('Failed to fetch gold rate', error.message);
      // Return stored rate as fallback
      const settings = await this.getSettings();
      return settings.marketGoldRate;
    }
  }
}
