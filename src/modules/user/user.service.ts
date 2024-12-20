import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Injectable, NotFoundException } from '@nestjs/common';
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
  // Méthode pour trouver un utilisateur par ID
  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // user online avec websocket
  async setUserOnline(userId: string, isOnline: boolean): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { isOnline },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async getOnlineFriends(userId: string) {
    // Fetch the user by ID
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If the user has no friends
    if (!user.friends || user.friends.length === 0) {
      return { message: 'User has no friends' };
    }

    // find online friends
    const onlineFriends = await this.userModel.find(
      {
        _id: { $in: user.friends },
        isOnline: true,
      },
      { username: 1, isOnline: 1 },
    );

    // Return the list of online friends
    if (onlineFriends.length > 0) {
      return onlineFriends;
    } else {
      return { message: 'No online friends found' };
    }
  }
}
