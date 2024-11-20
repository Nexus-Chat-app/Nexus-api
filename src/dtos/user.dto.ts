import { IsString, IsEmail, IsArray, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsArray()
  friends?: Types.ObjectId[];

  @IsBoolean()
  isOnline?: boolean;
}
