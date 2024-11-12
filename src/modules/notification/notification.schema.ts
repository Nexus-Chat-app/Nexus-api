import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document, Types} from "mongoose";

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  receiver: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
  senderId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Channel" })
  channelId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Message" })
  messageId?: Types.ObjectId;

  @Prop({ required: true, enum: ['friend_request', 'message', 'channel_invite'] })
  type: 'friend_request' | 'message' | 'channel_invite';

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
