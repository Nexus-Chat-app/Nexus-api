import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Friend, FriendSchema } from "./friend.schema";
import { FriendService } from "./friend.service";
import { FriendController } from "../../api/friends.controller";
import { FriendGateway } from "./friend.gateway";
import { AuthModule } from "../auth/auth.module";
import { AuthService } from "../auth/auth.service";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Friend.name, schema: FriendSchema }]),
        AuthModule,
    ],
    providers: [FriendService, FriendGateway],
    controllers: [FriendController],
    exports: [FriendService],
})
export class FriendModule {}