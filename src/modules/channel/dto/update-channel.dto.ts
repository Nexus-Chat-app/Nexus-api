import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsMongoId()
  owner?: Types.ObjectId;

  @IsOptional()
  @IsMongoId({ each: true })
  admins?: Types.ObjectId[];

  @IsOptional()
  @IsMongoId({ each: true })
  members?: Types.ObjectId[];
}
