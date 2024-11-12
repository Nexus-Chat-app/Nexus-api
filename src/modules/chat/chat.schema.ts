import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema()
export class Chat extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User"})
  receiver?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Channel", required: true })
  channelId?: Types.ObjectId;

  @Prop({default: false})
  isRead: boolean;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);