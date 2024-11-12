import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Friend extends Document {
    @Prop({type: Types.ObjectId, ref: 'User', required: true})
    requester: Types.ObjectId; // The user who sent the request
 
    @Prop({type: Types.ObjectId, ref: 'User', required: true})
    recipient: Types.ObjectId; // The user who received the request

    @Prop({default: 'pending'})
    status: 'pending' | 'accepted' | 'rejected'; 
}

export const FriendSchema = SchemaFactory.createForClass(Friend);