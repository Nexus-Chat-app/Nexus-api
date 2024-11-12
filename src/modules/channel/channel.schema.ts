import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Channel extends Document {
  @Prop({ required: true })
    name: string;

    @Prop({ type: Boolean, required: true })
    isPublic: boolean;

    @Prop({type: Types.ObjectId, ref: 'User', required: true})
    owner: Types.ObjectId;

    @Prop({type: Types.ObjectId, ref: 'User', default: []})
    admins: Types.ObjectId;

    @Prop({type: [Types.ObjectId], ref: 'User', default: []})
    members: Types.ObjectId[];

}

export const ChannelSchema = SchemaFactory.createForClass(Channel);