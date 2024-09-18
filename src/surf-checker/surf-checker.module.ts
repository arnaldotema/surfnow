import { Module } from '@nestjs/common';
import { SurfCheckerService } from './surf-checker.service';

@Module({
  providers: [SurfCheckerService],
  exports: [SurfCheckerService],
})
export class SurfCheckerModule {}