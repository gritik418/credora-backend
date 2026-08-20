import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { QUEUES } from '../constants/queue.constants';
import { JobsOptions, Queue } from 'bullmq';
import UserVerificationEmailDto from '../dto/email/user-verification.dto';
import EMAIL_JOB_NAMES from '../constants/email-job-names.constants';
import OrganizationVerificationEmailDto from '../dto/email/organization-verification.dto';

@Injectable()
export class EmailProducer {
  constructor(@InjectQueue(QUEUES.EMAIL) private readonly emailQueue: Queue) {}

  private jobOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: 50,
  };

  async sendUserVerificationEmail(data: UserVerificationEmailDto) {
    await this.emailQueue.add(
      EMAIL_JOB_NAMES.USER_VERIFICATION,
      data,
      this.jobOptions,
    );
  }

  async sendOrganizationVerificationEmail(
    data: OrganizationVerificationEmailDto,
  ) {
    await this.emailQueue.add(
      EMAIL_JOB_NAMES.ORGANIZATION_VERIFICATION,
      data,
      this.jobOptions,
    );
  }
}
