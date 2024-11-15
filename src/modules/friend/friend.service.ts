/* 
    Business logic for the friends module 
*/
import { InjectModel } from "@nestjs/mongoose";
import { Friend } from "./friend.schema";
import mongoose, { Model, ObjectId, Types } from "mongoose";
import { Injectable, Scope } from "@nestjs/common";
import { FriendDto } from 'src/dtos/friends.dto';
import { User } from "../user/user.schema";


@Injectable()
export class FriendService {
    constructor(@InjectModel(Friend.name) private friendmodel: Model<Friend>) { }

    async AddFriend(friendData: FriendDto): Promise<Friend> {
        const friend = new this.friendmodel(friendData);
        return await friend.save();
    }

    async GetAll(): Promise<Friend[]> {
        return await this.friendmodel.find();
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
}