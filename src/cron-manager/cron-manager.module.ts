import { Module } from '@nestjs/common';
import { CronManagerService } from './cron-manager.service';
import { UsersModule } from 'src/users/users.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [UsersModule, ScheduleModule.forRoot()],
  providers: [CronManagerService],
})
export class CronManagerModule {}
