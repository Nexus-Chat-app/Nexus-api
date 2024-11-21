/* 
    Database configuration file
*/

import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";

export const DatabaseConfig = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    // uri: configService.get<string>('DB_URI_ATLAS'),
    uri: configService.get<string>('DB_URI'),
  }),
  inject: [ConfigService],
});