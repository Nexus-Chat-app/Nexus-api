/* 
    This file contains the MongoDB Model for the notifications Module
*/

import { Module } from '@nestjs/common';
import { NotificationGateway } from './notifcation.gateway';

@Module({
  providers: [NotificationGateway],
})
export class NotificationModule {}
