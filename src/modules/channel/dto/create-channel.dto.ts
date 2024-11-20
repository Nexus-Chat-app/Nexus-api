import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  isPublic: boolean;

  @IsMongoId()
  owner: Types.ObjectId;

  @IsOptional()
  @IsMongoId({ each: true })
  admins?: Types.ObjectId[];

  @IsOptional()
  @IsMongoId({ each: true })
  members?: Types.ObjectId[];

  @IsOptional()
  @IsString()
  img?: string;
  
}
