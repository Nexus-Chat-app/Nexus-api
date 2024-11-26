import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../modules/user/user.schema';
import { UserService } from '../../modules/user/user.service';
import * as mongoose from 'mongoose';

describe('UserService', () => {
  let userService: UserService;
  let userModel: Model<User>;

  // Mock User Data
  const mockUser: Partial<User> = {
    _id: new mongoose.Types.ObjectId(),
    username: 'testuser',
    email: 'test@example.com',
    phone: '1234567890',
    password: 'hashedpassword',
    friends: [new mongoose.Types.ObjectId()],
    isOnline: false,
  };

  // Mock User Model
  const mockUserModel = {
    create: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn().mockResolvedValue([mockUser]),
    findById: jest.fn().mockResolvedValue(mockUser),
    findByIdAndUpdate: jest.fn().mockResolvedValue({
      ...mockUser,
      isOnline: true,
    }),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('setUserOnline', () => {
    it('should update user online status', async () => {
      const result = await userService.setUserOnline(
        mockUser._id.toString(),
        true,
      );
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id.toString(),
        { isOnline: true },
        { new: true },
      );
      expect(result.isOnline).toBe(true);
    });

    it('should throw an error if user not found', async () => {
      jest
        .spyOn(userModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce(null as any);
      await expect(
        userService.setUserOnline('invalidId', true),
      ).rejects.toThrowError();
    });
  });

  describe('getOnlineFriends', () => {
    it('should return a list of online friends', async () => {
      const onlineFriend = { _id: mockUser.friends[0], isOnline: true };
      jest
        .spyOn(userModel, 'find')
        .mockResolvedValueOnce([onlineFriend] as any);

      const result = await userService.getOnlineFriends(
        mockUser._id.toString(),
      );

      expect(userModel.find).toHaveBeenCalledWith(
        {
          _id: { $in: mockUser.friends },
          isOnline: true,
        },
        { username: 1, isOnline: 1 },
      );
      expect(result).toEqual([onlineFriend]);
    });

    it('should return a message if no friends found', async () => {
      jest.spyOn(userModel, 'find').mockResolvedValueOnce([]);

      const result = await userService.getOnlineFriends(
        mockUser._id.toString(),
      );

      expect(result).toEqual({ message: 'No online friends found' });
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(null);
      await expect(
        userService.getOnlineFriends('invalidId'),
      ).rejects.toThrowError();
    });
  });
});