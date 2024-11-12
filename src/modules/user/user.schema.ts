import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true })
  password: string;
  
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  friends: Types.ObjectId[];
  
  @Prop({ default: false })
  isOnline: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
