import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    await this.seedDefaultUser();
  }

  async seedDefaultUser() {
    const email = 'mkfamily@gmail.com';
    const existingUser = await this.userModel.findOne({ email });

    if (!existingUser) {
      console.log('Seeding default user...');
      const passwordHash = await argon2.hash('Mk@123');
      const newUser = new this.userModel({
        email,
        passwordHash,
      });
      await newUser.save();
      console.log('Default user created.');
    } else {
      console.log('Default user already exists.');
    }
  }

  async findOne(email: string): Promise<any> {
    return await this.userModel.findOne({ email }).exec();
  }
}
