import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CronManagerService implements OnModuleInit {
  constructor(private usersService: UsersService) {}

  onModuleInit() {
    this.initializeCronJobs();
  }

  initializeCronJobs() {
    this.initializeDailyCredits();
  }

  initializeDailyCredits() {
    try {
      // for future implementation
    } catch (error) {
      console.log('Daily Credits Cron Job failed to start', error.message);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    utcOffset: 0,
  })
  handleAddDailyCredits() {
    this.usersService.addDailyCreditsForAllUsers(
      Number(process.env.USER_DAILY_FREE_CREDITS),
      Number(process.env.USER_MAX_FREE_CREDITS),
    );
  }
}
