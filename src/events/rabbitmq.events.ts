// import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User } from '../modules/user/user.schema';

// @Injectable()
// export class RabbitMQEvents implements OnModuleInit {
//   private readonly logger = new Logger(RabbitMQEvents.name);

//   constructor(
//     private readonly amqpConnection: AmqpConnection,
//     @InjectModel(User.name) private readonly userModel: Model<User>,
//   ) {}

//   async onModuleInit() {
//     try {
//       // Assert exchange and queue
//       const channel = await this.amqpConnection.createChannel();
//       await channel.assertExchange('auth-events', 'fanout', { durable: false });
//       const queue = await channel.assertQueue('chat-service-queue', {
//         durable: false,
//       });
//       await channel.bindQueue(queue.queue, 'auth-events', '');

//       // Consume messages
//       channel.consume(queue.queue, async (msg) => {
//         if (msg) {
//           const event = JSON.parse(msg.content.toString());
//           this.logger.log(`Received event: ${event.eventType}`);

//           // Handle different event types
//           if (event.eventType === 'USER_REGISTERED') {
//             await this.handleUserRegistered(event.payload);
//           }

//           // Acknowledge message
//           channel.ack(msg);
//         }
//       });
//     } catch (error) {
//       this.logger.error('Error during RabbitMQ event handling:', error);
//     }
//   }

//   // Method to handle 'USER_REGISTERED' event
//   async handleUserRegistered(payload: any) {
//     const { id, username, email } = payload;

//     try {
//       // Check if the user already exists in the chat service database
//       const existingUser = await this.userModel.findOne({ _id: id });

//       if (!existingUser) {
//         // Add the new user to the Chat Service database
//         const newUser = new this.userModel({ _id: id, username, email });
//         await newUser.save();
//         this.logger.log(`User synced to Chat Service database: ${username}`);
//       } else {
//         this.logger.log(`User already exists in Chat Service database: ${id}`);
//       }
//     } catch (error) {
//       this.logger.error(`Error while syncing user to Chat Service database: ${id}`, error);
//     }
//   }
// }
