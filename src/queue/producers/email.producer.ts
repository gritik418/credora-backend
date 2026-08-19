import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { QUEUES } from '../constants/queue.constants';
import { Queue } from 'bullmq';
import UserVerificationEmailDto from '../dto/email/user-verification.dto';
import EMAIL_JOB_NAMES from '../constants/email-job-names.constants';

@Injectable()
export class EmailProducer {
  constructor(@InjectQueue(QUEUES.EMAIL) private emailQueue: Queue) {}

  async sendUserVerificationEmail(data: UserVerificationEmailDto) {
    await this.emailQueue.add(EMAIL_JOB_NAMES.USER_VERIFICATION, data);
  }
}
