import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChannelService } from '../../modules/channel/channel.service';
import { Channel } from '../../modules/channel/channel.schema';
import { Model, Types } from 'mongoose';

describe('ChannelService', () => {
  let service: ChannelService;
  let model: Model<Channel>;

  const mockObjectId = new Types.ObjectId(); // Create a valid ObjectId for testing

  const mockChannelData = {
    name: 'Test Channel',
    isPublic: true,
    owner: mockObjectId,
    admins: [],
    members: [],
  };

  const mockChannelDoc = (mock?: Partial<Channel>): Partial<Channel> => ({
    ...mockChannelData,
    ...mock,
  });

  const channelArray = [
    mockChannelDoc({ name: 'Channel 1' }),
    mockChannelDoc({ name: 'Channel 2' }),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        {
          provide: getModelToken(Channel.name),
          useValue: {
            create: jest.fn().mockResolvedValue(mockChannelDoc(mockChannelData)),
            save: jest.fn(),
            find: jest.fn().mockReturnValue(channelArray),
          },
        },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
    model = module.get<Model<Channel>>(getModelToken(Channel.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createChannel', () => {
    it('should create a new channel', async () => {
      const result = await service.createChannel(mockChannelData);

      expect(result).toEqual(mockChannelDoc(mockChannelData));
      expect(model.create).toHaveBeenCalledWith(mockChannelData);
    });
  });
});
