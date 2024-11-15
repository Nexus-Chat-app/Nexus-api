/* 
    Business logic for the friends module 
*/
import { InjectModel } from "@nestjs/mongoose";
import { Friend, FriendSchema } from "./friend.schema";
import mongoose, { Model, ObjectId, Types } from "mongoose";
import { Injectable, Scope } from "@nestjs/common";
import { FriendDto } from 'src/dtos/friends.dto';
import { User } from "../user/user.schema";
import { json } from "stream/consumers";


@Injectable()
export class FriendService {
    constructor(@InjectModel(Friend.name) private friendmodel: Model<Friend>) { }

    async AddFriend(friendData: FriendDto): Promise<Friend> {
        const Friends = await this.friendmodel.find({requester: friendData.requester , recipient: friendData.requester });
        if(!Friends){
            const friend = new this.friendmodel(friendData);
            return await friend.save();
        }else{
            return
        }
    }

    async GetAllFriends(UserId: string): Promise<Friend[]> {
        try {
            const FriendRequests = await this.friendmodel.find({status: "accepted" , recipient: UserId });
            if (!FriendRequests) {
                return []
            }
            return FriendRequests
        } catch (Error) {
            throw new Error
        }
    }

    async AllFriendRequests(UserId: string): Promise<Friend[]> {
        try {
            const FriendRequests = await this.friendmodel.find({status: "pending" , recipient: UserId });
            if (!FriendRequests) {
                return []
            }
            return FriendRequests
        } catch (Error) {
            throw new Error
        }
    }

    async AcceptOrRefuseFriendRequests(UserId : string , Data  ) : Promise<Friend>{
        try {
            // console.log(UserId , Data.requester);
            const FriendRequest =  await this.friendmodel.find({status : "pending" , requester: Data.requester  , recipient: UserId });
            if(FriendRequest){
                console.log(FriendRequest[0]);
                FriendRequest[0].status = Data.status
                return await FriendRequest[0].save()
            }else{
                return
            }
        } catch (error) {
            return error
        }
    }
}