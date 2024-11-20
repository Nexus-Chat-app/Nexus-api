import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Friend, FriendSchema } from "./friend.schema";
import { FriendService } from "./friend.service";
import { FriendController } from "../../api/friends.controller";
import { FriendGateway } from "./friend.gateway";
import { UserService } from "../user/user.service";
import { User } from "../user/user.schema";
import { UserModule } from "../user/user.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Friend.name, schema: FriendSchema }]),
        UserModule,
    ],
    providers: [FriendService, FriendGateway , UserService],
    controllers: [FriendController],
    exports: [FriendService],
})
export class FriendModule {}