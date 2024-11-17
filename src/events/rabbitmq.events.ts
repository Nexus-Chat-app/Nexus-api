import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { log } from 'console';

@Injectable()
export class RabbitMQEvents implements OnModuleInit {
  private channel: amqp.Channel;

  async onModuleInit() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    this.channel = await connection.createChannel();
    await this.channel.assertExchange('auth-events', 'fanout', {
      durable: false,
    });

    const queue = await this.channel.assertQueue('', { exclusive: true });
    this.channel.bindQueue(queue.queue, 'auth-events', '');

    this.channel.consume(
      queue.queue,
      (msg) => {
        if (msg) {
          const event = JSON.parse(msg.content.toString());
          this.handleEvent(event);
        }
      },
      { noAck: true },
    );

    console.log('Connected to RabbitMQ and listening for events...');
  }

  private async handleEvent(event: any) {
    console.log('Received event:', event);
    if(event.eventType === 'USER_REGISTERED') {
        console.log('User registered:', event.data);
    }
  }
}
