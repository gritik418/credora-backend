import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QUEUES } from './constants/queue.constants';
import { EmailProducer } from './producers/email.producer';
import { EmailProcessor } from './processors/email.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUES.EMAIL,
    }),
  ],
  providers: [EmailProducer, EmailProcessor],
  exports: [EmailProducer],
})
export class QueueModule {}
