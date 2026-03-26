import { Module } from '@nestjs/common';
import { SatuSehatController } from './satu-sehat.controller';
import { SatuSehatService } from './satu-sehat.service';
import { QueueService } from '../../queues/queue.service';

@Module({
  controllers: [SatuSehatController],
  providers: [SatuSehatService, QueueService],
  exports: [SatuSehatService],
})
export class SatuSehatModule {}
