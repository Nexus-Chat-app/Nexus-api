import { Controller, Post, Body, Req, UseGuards, Param, Get } from '@nestjs/common';
import { ChatService } from '../modules/chat/chat.service';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';
import { Request } from 'express';
import { ChatGateway } from '../modules/chat/chat.gateway';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('send')
  @UseGuards(AuthMiddleware) 
  async sendMessage(
    @Body() data: { content: string; receiver: string; channelId?: string },
    @Req() req: Request,
  ) {
    const sender = req.user?._id; 
    // console.log('Sender:', sender);
    

    if (!sender) {
      return { error: 'Sender is not authenticated' };
    }

    const chat = await this.chatService.createChat(
      {
        content: data.content,
        sender: sender,
        receiver: data.receiver,
        channelId: data.channelId,
      },
      this.chatGateway.server,
    );

    return { success: true, chat };
  }
  // Get messages by channel
  @Get('channel/:channelId')
  async getChannelMessages(@Param('channelId') channelId: string) {
    return this.chatService.getChatsByChannel(channelId);
  }

  // Get messages between two users
  @Get('user/:receiverId')
  async getUserMessages(@Req() req, @Param('receiverId') receiverId: string) {
    const sender = req.user._id; // Extract sender from the authenticated user
    return this.chatService.getChatsBetweenUsers(sender, receiverId);
  }
}
