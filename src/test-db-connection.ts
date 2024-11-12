import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { UserService } from './modules/user/user.service';
import { ChannelService } from './modules/channel/channel.service';
import { ChatService } from './modules/chat/chat.service';
import { Types } from 'mongoose';

async function testDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userService = app.get(UserService);
    const channelService = app.get(ChannelService);
    const chatService = app.get(ChatService);

    console.log("Testing MongoDB connection...");
    
    // Fetch all users to confirm the database connection
    const users = await userService.findAll();
    console.log(`Successfully connected! User count: ${users.length}`);

    // Test creating a user
    const testUser = await userService.createUser({
      username: 'testuser',
      email: 'testuser@example.com',
      phone: '1234567890',
      password: 'testpassword',
    });
    console.log('User created successfully:', testUser);

    // Extract user ID and validate it's an ObjectId
    const testUserId = new Types.ObjectId(testUser._id.toString());

    // Test creating a channel
    const testChannel = await channelService.createChannel({
      name: 'Test Channel',
      isPublic: true,
      owner: testUserId,
      admins: [testUserId],
      members: [testUserId],
    });
    console.log('Channel created successfully:', testChannel);

    // Extract channel ID and validate it's an ObjectId
    const testChannelId = new Types.ObjectId(testChannel._id.toString());

    // Test adding a message to the channel
    const testMessage = await chatService.createMessage({
      content: 'Hello, Test!',
      sender: testUserId,
      channelId: testChannelId,
    });
    console.log('Message added successfully:', testMessage);

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await app.close();
  }
}

testDatabase();
