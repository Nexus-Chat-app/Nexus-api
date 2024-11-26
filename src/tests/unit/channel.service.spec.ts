import { Test, TestingModule } from '@nestjs/testing';
import { ChannelService } from '../../modules/channel/channel.service';
import { getModelToken } from '@nestjs/mongoose';
import { Channel } from '../../modules/channel/channel.schema';
import { User } from '../../modules/user/user.schema';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose'; 

describe('ChannelService', () => {
  let service: ChannelService;
  let channelModel: any;
  let userModel: any;

  const mockChannel = {
    _id: new Types.ObjectId('60d5f8f8c3eae4b3f1d63f5f'), 
    name: 'Test Channel',
    isPublic: true,
    owner: new Types.ObjectId('60d5f8f8c3eae4b3f1d63f5f'), 
    admins: [new Types.ObjectId('60d5f8f8c3eae4b3f1d63f5f')], 
    members: [new Types.ObjectId('60d5f8f8c3eae4b3f1d63f5f')], 
  };

  const mockUser = {
    _id: new Types.ObjectId('60d5f8f8c3eae4b3f1d63f5f'),
    username: 'testuser',
    isOnline: true,
  };

  beforeEach(async () => {
    channelModel = {
      findById: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockChannel),
        }),
      }),
      find: jest.fn().mockResolvedValue([mockChannel]),
      create: jest.fn().mockResolvedValue(mockChannel),
    };

    userModel = {
      findById: jest.fn().mockResolvedValue(mockUser),
      find: jest.fn().mockResolvedValue([mockUser]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        {
          provide: getModelToken(Channel.name),
          useValue: channelModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
  });


  describe('getOnlineMembers', () => {
    it('should return online members of a channel', async () => {
      const channelId = '60d5f8f8c3eae4b3f1d63f5f';
      const onlineMembers = [mockUser];

      channelModel.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest
            .fn()
            .mockResolvedValue({ ...mockChannel, members: [mockUser._id] }),
        }),
      });

      userModel.find = jest.fn().mockResolvedValue(onlineMembers);

      const result = await service.getOnlineMembers(channelId);
      expect(result).toEqual(onlineMembers);
      expect(userModel.find).toHaveBeenCalledWith({
        _id: { $in: [mockUser._id] },
        isOnline: true,
      });
    });

    it('should throw an error if channel not found', async () => {
      channelModel.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const channelId = 'non-existent-id';

      await expect(service.getOnlineMembers(channelId)).rejects.toThrow(
        NotFoundException,
      );
    });

  });

});
