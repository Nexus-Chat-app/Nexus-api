import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendModule } from './friend.module';
import { FriendService } from './friend.service';
import { FriendGateway } from './friend.gateway';
import { Friend } from './friend.schema';
import { Types } from 'mongoose';
import { ConfigModule } from '@nestjs/config';

describe('FriendController', () => {
  let app: INestApplication;
  let friendService: FriendService;

  const TEST_FRIEND = {
    _id: new Types.ObjectId(),
    requester: new Types.ObjectId(),
    recipient: new Types.ObjectId(),
    status: 'pending',
  } as const;

  const mockFriendService = {
    GetAllFriends: jest.fn(),
    AllFriendRequests: jest.fn(),
    AddFriend: jest.fn(),
    AcceptOrRefuseFriendRequests: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        FriendModule,
      ],
      providers: [
        { provide: FriendService, useValue: mockFriendService },
        FriendGateway,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    friendService = module.get<FriendService>(FriendService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/GET friends/:id', () => {
    it('should return all friends', async () => {
      mockFriendService.GetAllFriends.mockResolvedValue([TEST_FRIEND]);

      const response = await request(app.getHttpServer())
        .get(`/api/Friend/${TEST_FRIEND._id}`)
        .expect(200);

      expect(mockFriendService.GetAllFriends).toHaveBeenCalledWith(TEST_FRIEND._id.toString());
      expect(response.body).toEqual([TEST_FRIEND]);
    });
  });

  describe('/GET requests/:id', () => {
    it('should return all friend requests', async () => {
      mockFriendService.AllFriendRequests.mockResolvedValue([TEST_FRIEND]);

      const response = await request(app.getHttpServer())
        .get(`/api/Friend/requests/${TEST_FRIEND._id}`)
        .expect(200);

      expect(mockFriendService.AllFriendRequests).toHaveBeenCalledWith(TEST_FRIEND._id.toString());
      expect(response.body).toEqual([TEST_FRIEND]);
    });
  });

  describe('/POST addFriend', () => {
    const friendDto = {
      requester: 'userId1',
      recipient: 'userId2',
    };

    it('should add a friend successfully', async () => {
      mockFriendService.AddFriend.mockResolvedValue(TEST_FRIEND);

      const response = await request(app.getHttpServer())
        .post('/api/Friend/addFriend')
        .send(friendDto)
        .expect(201);

      expect(mockFriendService.AddFriend).toHaveBeenCalledWith(friendDto);
      expect(response.body.message).toBe('Friend Request sent successfully');
    });
  });
});
