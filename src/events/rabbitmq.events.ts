import { Injectable, OnModuleInit } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../modules/user/user.schema';

@Injectable()
export class RabbitMQEvents implements OnModuleInit {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async onModuleInit() {
    // Assert exchange and queue
    const channel = await this.amqpConnection.createChannel();
    await channel.assertExchange('auth-events', 'fanout', { durable: false });
    const queue = await channel.assertQueue('chat-service-queue', {
      durable: false,
    });
    await channel.bindQueue(queue.queue, 'auth-events', '');

    // Consume messages
    channel.consume(queue.queue, async (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        console.log('Received event:', event);

        if (event.eventType === 'USER_REGISTERED') {
          await this.handleUserRegistered(event.payload);
        }
        channel.ack(msg); // Acknowledge message
      }
    });
  }

  async handleUserRegistered(payload: any) {
    const { id, username, email } = payload;

    // Check if the user already exists in the chat service database
    const existingUser = await this.userModel.findOne({ _id: id });
    if (!existingUser) {
      // Add the new user to the Chat Service database
      await this.userModel.create({ _id: id, username, email });
      console.log('User synced to Chat Service database:', payload);
    } else {
      console.log('User already exists in Chat Service database:', id);
    }
  }
}
