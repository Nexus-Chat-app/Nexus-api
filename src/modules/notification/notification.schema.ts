import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document, Types} from "mongoose";

@Schema({timestamps: true})
export class Notification extends Document {
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    receiver: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    senderId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Channel", required: true })
    channelId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Message", required: true })
    messageId?: Types.ObjectId;

    @Prop({required: true})
    type: 'friend_request' | 'message' | 'channel_invite'; 

    @Prop({ required: true })
    isRead: boolean;
}