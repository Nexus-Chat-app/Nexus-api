/* 
    Business logic for the friends module 
*/
import { InjectModel } from "@nestjs/mongoose";
import { Friend, FriendSchema } from "./friend.schema";
import mongoose, { Model, ObjectId, Types } from "mongoose";
import { Injectable, Scope, NotFoundException, BadRequestException } from "@nestjs/common";
import { FriendDto } from 'src/dtos/friends.dto';
import { User } from "../user/user.schema";


@Injectable()
export class FriendService {
    constructor(@InjectModel(Friend.name) private friendmodel: Model<Friend> , @InjectModel("User") private readonly userModel: Model<User>,) { }

    async AddFriend(friendData: FriendDto): Promise<Friend> {
        try {
            const existingFriends = await this.friendmodel.find({
                $and: [
                    { requester: friendData.requester },
                    { recipient: friendData.recipient },
                    {status: "pending"}
                ]
            });

            if (existingFriends && existingFriends.length > 0) {
                throw new BadRequestException('Friend request already exists.');
            }

            const friend = new this.friendmodel(friendData);
            return await friend.save();
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // async FindUser(username: string): Promise<User[]> {
    //     try {
    //         const users = await this.userModel.find({
    //             username: { $regex: username, $options: 'i' }
    //         });
    //         if (!users || users.length === 0) {
    //             throw new NotFoundException('No users found.');
    //         }
    //         return users;
    //     } catch (error) {
    //         throw new BadRequestException(error.message);
    //     }
    // }

    async FindFriend(friendData: FriendDto): Promise<Friend> {
        try {
            const friend = await this.friendmodel.findOne(friendData);
            if (!friend) {
                throw new NotFoundException('Friend not found.');
            }
            return friend;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async GetAllFriends(UserId: string): Promise<Friend[]> {
        try {
            const friendRequests = await this.friendmodel.find({ status: "accepted", recipient: UserId });
            if (!friendRequests || friendRequests.length === 0) {
                throw new NotFoundException('No friends found for this user.');
            }
            return friendRequests;
        } catch (error) {
            throw new BadRequestException('Error fetching friends: ' + error.message);
        }
    }

    async AllFriendRequests(UserId: string): Promise<Friend[]> {
        try {
            const friendRequests = await this.friendmodel.find({
                $and: [
                    { status: "pending" },
                    { recipient: UserId },
                ]
            });
            if (!friendRequests || friendRequests.length === 0) {
                throw new NotFoundException('No friend requests found for this user.');
            }
            return friendRequests;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async AcceptOrRefuseFriendRequests(UserId: string, Data: { _id: string; status: string }): Promise<Friend> {
        try {
            const friendRequest = await this.friendmodel.findOne({
                $and: [
                    {_id: Data._id},
                    {recipient: UserId }
                ]
            });
            if (!friendRequest) {
                throw new NotFoundException('Friend request not found or already processed.');
            }else if (friendRequest.status === "rejected" || friendRequest.status === "accepted" ){
                throw new Error("Friend request is already "+friendRequest.status );
            }else{
                friendRequest.status = Data.status;
                return await friendRequest.save();
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}