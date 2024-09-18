import { Test, TestingModule } from '@nestjs/testing';
import { SurfCheckerService } from './surf-checker.service';

describe('SurfCheckerService', () => {
  let service: SurfCheckerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SurfCheckerService],
    }).compile();

    service = module.get<SurfCheckerService>(SurfCheckerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
