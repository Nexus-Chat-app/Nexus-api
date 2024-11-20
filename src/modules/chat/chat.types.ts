import { Types } from 'mongoose';

export type ObjectIdType = Types.ObjectId | string;

export interface ChatBase {
  content: string;
  sender: ObjectIdType;
  receiver?: ObjectIdType;
  channelId?: ObjectIdType;
  isRead?: boolean;
}

export interface ChatInput extends ChatBase {}

export interface ChatOutput extends ChatBase {
  _id: ObjectIdType; 
  createdAt: Date;
  updatedAt: Date;
}
