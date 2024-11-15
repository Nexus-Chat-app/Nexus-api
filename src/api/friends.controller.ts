/* 
    Friend request handeling
*/
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Friend } from "src/modules/friend/friend.schema";
import { FriendService } from "src/modules/friend/friend.service";
import { FriendDto } from "../dtos/friends.dto";

@Controller("api/Friend")
export class FrinedController {
    constructor(private readonly friendSrevice: FriendService){}

    @Get(":id")
    async GetAllFriends(@Param("id") UserId: string): Promise<Friend[]>{
        return this.friendSrevice.GetAllFriends(UserId)
    }

    @Get("requests/:id")
    async GetAllFriendRequests(@Param("id") UserId: string): Promise<Friend[]>{
        return this.friendSrevice.AllFriendRequests(UserId)
    }

    @Post("addFriend")
    async CreateFriendRequest(@Body() friendDto: FriendDto): Promise<Friend>{
        return this.friendSrevice.AddFriend(friendDto)
    }

    @Post(":id/Accept_Refuse")
    async AcceptOrRefuseFriendRequests(@Param("id") UserId:string, @Body() Data ) : Promise<Friend>{
        return this.friendSrevice.AcceptOrRefuseFriendRequests(UserId,Data)
    }
}