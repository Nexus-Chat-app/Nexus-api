import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
  receiver?: Types.ObjectId; // Optional if using in channels

  @Prop({ type: Types.ObjectId, ref: "Channel" })
  channelId?: Types.ObjectId; // Optional if using direct messages

  @Prop({ default: false })
  isRead: boolean;
}

export type ChatDocument = Chat & Document;
export const ChatSchema = SchemaFactory.createForClass(Chat);
