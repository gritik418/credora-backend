import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUES } from '../constants/queue.constants';
import { Job } from 'bullmq';

@Processor(QUEUES.EMAIL)
export class EmailProcessor extends WorkerHost {
  async process(job: Job, token?: string): Promise<any> {
    switch (job.name) {
      case '':
        return;

      default:
        return;
    }
  }
}
