import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = AppSettings & Document;

@Schema({ timestamps: true })
export class AppSettings {
  @Prop({ default: 0 })
  marketGoldRate: number; // Per gram

  @Prop({ default: 0 })
  bankGoldRate: number; // Per gram (lower than market)

  @Prop({ default: 10 })
  defaultRetentionPercent: number; // e.g. 10%

  @Prop()
  lastUpdated: Date;
}

export const SettingsSchema = SchemaFactory.createForClass(AppSettings);
