/* 
    Friend request handeling
*/
import { Body, Controller, Get, Param, Post, NotFoundException, BadRequestException, Query, Inject, forwardRef } from "@nestjs/common";
import { Friend } from "../modules/friend/friend.schema";
import { FriendService } from "../modules/friend/friend.service";
import { FriendDto } from "../dtos/friends.dto";
import { FriendGateway } from "../modules/friend/friend.gateway";
import { UserService } from "../modules/user/user.service";
import { User } from "../modules/user/user.schema";


@Controller("api/Friend")
export class FriendController {
    constructor(
        private readonly friendService: FriendService,
        private readonly friendGateway: FriendGateway,
        private readonly UserService: UserService
    ) {}

    @Get(":id")
    async GetAllFriends(@Param("id") UserId: string): Promise<Friend[]> {
        try {
            const friends = await this.friendService.GetAllFriends(UserId);
            if (!friends || friends.length === 0) {
                throw new NotFoundException('No friends found for this user.');
            }
            return friends;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get("requests/:id")
    async GetAllFriendRequests(@Param("id") UserId: string): Promise<Friend[]> {
        try {
            const friendRequests = await this.friendService.AllFriendRequests(UserId);
            if (!friendRequests || friendRequests.length === 0) {
                throw new NotFoundException('No friend requests found for this user.');
            }
            return friendRequests;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    /* 
        Find user by username
    */

    @Get("FindUser/:Username")
    async FindUser(@Param("Username") Username: string): Promise<User[]> {
        try {
            const Users = await this.UserService.FindUser(Username);
            return Users;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post("addFriend")
    async CreateFriendRequest(@Body() friendDto: FriendDto): Promise<{ message: string; friend?: Friend }> {
        try {
            const newRequest = await this.friendService.AddFriend(friendDto);
            if (newRequest) {
                this.friendGateway.server.emit("friendRequestReceived", {
                    requester: friendDto.requester,
                    recipient: friendDto.recipient,
                });
                return { message: "Friend Request sent successfully", friend: newRequest };
            } else {
                throw new BadRequestException('Friend request already exists.');
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post(":id/Accept_Refuse")
    async AcceptOrRefuseFriendRequests(@Param("id") UserId: string, @Body() Data): Promise<{ message: string; friend?: Friend }> {
        try {
            const updatedFriend = await this.friendService.AcceptOrRefuseFriendRequests(UserId, Data);
            if (updatedFriend) {
                return { message: 'Friend request updated successfully', friend: updatedFriend };
            } else {
                throw new NotFoundException('Friend request not found or already processed.');
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}