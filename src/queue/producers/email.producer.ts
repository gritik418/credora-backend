import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import EMAIL_JOB_NAMES from '../constants/email-job-names.constants';
import { QUEUES } from '../constants/queue.constants';
import OrganizationInviteDto from '../dto/email/organization-invite.dto';
import UserVerificationEmailDto from '../dto/email/user-verification.dto';

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

  async sendOrganizationInviteEmail(data: OrganizationInviteDto) {
    await this.emailQueue.add(
      EMAIL_JOB_NAMES.ORGANIZATION_INVITE,
      data,
      this.jobOptions,
    );
  }
}
