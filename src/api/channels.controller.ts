/* 
    Group and private channels management
*/
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ChannelService } from '../modules/channel/channel.service';
import { Channel } from '../modules/channel/channel.schema';
import { Types } from 'mongoose';
import { CreateChannelDto } from '../modules/channel/dto/create-channel.dto';
import { UpdateChannelDto } from '../modules/channel/dto/update-channel.dto';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) { }
  
   /**
   * Create a new channel
   */
  @Post('create')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `channel-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async createChannel(
    @Body() channelData: CreateChannelDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Channel> {

    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    channelData['img'] = `/uploads/${file.filename}`;
    return this.channelService.createChannel(channelData);
  }
  @Get(':id')
  async getChannelById(@Param('id') id: string): Promise<Channel> {
    return this.channelService.getChannelById(new Types.ObjectId(id));
  }

  @Get()
  async getAllChannels(): Promise<Channel[]> {
    return this.channelService.getAllChannels();
  }
 /**
   * Update an existing channel
   */
  @Patch('update/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `channel-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )

  async updateChannel(
    @Param('id') id: string,
    @Body() updateData: UpdateChannelDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Channel> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid channel ID');
    }

    const objectId = new Types.ObjectId(id);
    const imgPath = file ? `/uploads/${file.filename}` : undefined; 
    return this.channelService.updateChannel(objectId, updateData, imgPath);
  }

 /**
   * Delete a channel
   */
  @Delete('delete/:id')
  async deleteChannel(@Param('id') id: string): Promise<{ deleted: boolean }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid channel ID');
    }
    return this.channelService.deleteChannel(new Types.ObjectId(id));
  }
  
  
 /**
   * Add members to a channel
   */
  @Post(':channelId/add-member')
  async addMember(
    @Param('channelId') channelId: string,
    @Body('ownerId') ownerId: string,
    @Body('userId') userId: string,
  ): Promise<Channel> {
    return this.channelService.addMember(
      new Types.ObjectId(channelId),
      new Types.ObjectId(ownerId),
      new Types.ObjectId(userId),
    );
  }
  
 /**
   * Delete members from channel
   */
  @Delete(':channelId/remove-member')
  async removeMember(
    @Param('channelId') channelId: string,
    @Body('ownerId') ownerId: string,
    @Body('userId') userId: string,
  ): Promise<Channel> {
    return this.channelService.removeMember(
      new Types.ObjectId(channelId),
      new Types.ObjectId(ownerId),
      new Types.ObjectId(userId),
    );
  }
}
