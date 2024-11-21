import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async FindUser(username: string): Promise<User[]> {
    try {
        const users = await this.userModel.find({ username: { $regex: username, $options: 'i' } }).exec();
        if (!users || users.length === 0) {
            throw new NotFoundException('No users found.');
        }
        return users;
    } catch (error) {
        throw new BadRequestException(error.message);
    }
  }
}