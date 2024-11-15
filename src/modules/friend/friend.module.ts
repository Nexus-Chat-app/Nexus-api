/* 
    Model for friend relationships 
*/

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FriendSchema } from "./friend.schema";
import { FriendService } from "./friend.service";
import { FrinedController } from "src/api/friends.controller";

@Module({
    imports: [MongooseModule.forFeature([{name: 'Friend' , schema: FriendSchema}])],
    providers: [FriendService],
    controllers: [FrinedController],
    exports: [FriendService],
})
export class FriendModule{}