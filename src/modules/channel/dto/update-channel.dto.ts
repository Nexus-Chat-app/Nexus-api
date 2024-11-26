import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  img?: string; 
}
