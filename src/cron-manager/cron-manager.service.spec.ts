import { Test, TestingModule } from '@nestjs/testing';
import { CronManagerService } from './cron-manager.service';

describe('CronManagerService', () => {
  let service: CronManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CronManagerService],
    }).compile();

    service = module.get<CronManagerService>(CronManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
