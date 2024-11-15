/* 
    Friend request handeling
*/
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Friend } from "src/modules/friend/friend.schema";
import { FriendService } from "src/modules/friend/friend.service";
import { FriendDto } from "../dtos/friends.dto";

@Controller("api/FriendRequest")
export class FrinedController {
    constructor(private readonly friendSrevice: FriendService){}

    @Get(":id")
    async GetAllFriends(@Param("id") UserId: string): Promise<Friend[]>{
        return this.friendSrevice.AllFriendRequests(UserId)
    }

    @Post("addFriend")
    async CreateFriendRequest(@Body() friendDto: FriendDto): Promise<Friend>{
        return this.friendSrevice.AddFriend(friendDto)
    }
}