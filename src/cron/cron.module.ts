import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { SurfCheckerModule } from '../surf-checker/surf-checker.module';
import { UsersModule } from '../users/users.module';
import { NotificationModule } from '../notification/notification.module';
import {ScheduleModule} from "@nestjs/schedule";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        SurfCheckerModule,
        UsersModule,
        NotificationModule,
    ],
    providers: [CronService],
    exports: [CronService],
})
export class CronModule {}