import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SurfCheckerModule } from './surf-checker/surf-checker.module';
import { NotificationModule } from './notification/notification.module';
import { UsersModule } from './users/users.module';
import { CronService } from './cron/cron.service';
import {CronModule} from "./cron/cron.module";
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SurfCheckerModule,
    NotificationModule,
    UsersModule,
    CronModule,
  ],
  providers: [AppService]
})
export class AppModule {}