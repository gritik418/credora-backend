import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QUEUES } from './constants/queue.constants';
import { EmailProducer } from './producers/email.producer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUES.EMAIL,
    }),
  ],
  providers: [EmailProducer],
  exports: [EmailProducer],
})
export class QueueModule {}
