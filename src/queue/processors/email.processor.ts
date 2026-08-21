import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUES } from '../constants/queue.constants';
import { Job } from 'bullmq';
import { OnModuleInit } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';
import templateNames from '../constants/template-names.constants';
import { readFile } from 'fs/promises';
import * as handlebars from 'handlebars';
import UserVerificationEmailDto from '../dto/email/user-verification.dto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import EMAIL_JOB_NAMES from '../constants/email-job-names.constants';
import OrganizationVerificationEmailDto from '../dto/email/organization-verification.dto';

@Processor(QUEUES.EMAIL)
export class EmailProcessor extends WorkerHost implements OnModuleInit {
  private templates = new Map<string, HandlebarsTemplateDelegate>();
  private transporter: nodemailer.Transporter;
  private fromEmail: string = "'Credora' <noreply@credora.com>";
  private clientUrl: string;
  private logoUrl: string;

  constructor(private configService: ConfigService) {
    super();

    this.clientUrl =
      this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    this.logoUrl =
      this.configService.get<string>('LOGO_URL') ||
      'http://localhost:3000/logo.jpeg';

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_SERVICE'),
      port: Number(this.configService.get<string>('SMTP_PORT')),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async onModuleInit() {
    await this.loadTemplates();
  }

  private getTemplatePath(template: string): string {
    const distPath = join(
      process.cwd(),
      'dist',
      'queue',
      'templates',
      `${template}.hbs`,
    );

    const srcPath = join(
      process.cwd(),
      'src',
      'queue',
      'templates',
      `${template}.hbs`,
    );

    return existsSync(distPath) ? distPath : srcPath;
  }

  private async loadTemplates() {
    try {
      const templatesToLoad = Object.values(templateNames);

      for (const templateName of templatesToLoad) {
        try {
          const templatePath = this.getTemplatePath(templateName);
          const source = await readFile(templatePath, { encoding: 'utf-8' });
          this.templates.set(templateName, handlebars.compile(source));
        } catch (error) {
          console.warn(`⚠️ Failed to load template ${templateName}`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load templates:', error);
    }
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case EMAIL_JOB_NAMES.USER_VERIFICATION:
        await this.sendEmail({
          to: data.email,
          subject: 'Verify your Credora account',
          text: 'Please verify your email address to complete your Credora account setup.',
          data,
          templateName: templateNames.userVerification,
        });
        break;

      case EMAIL_JOB_NAMES.ORGANIZATION_VERIFICATION:
        await this.sendEmail({
          to: job.data.email,
          subject: 'Verify your organization account',
          text: 'Please verify your organization email address to complete your organization account setup.',
          data: job.data,
          templateName: templateNames.organizationVerification,
        });
        break;

      case EMAIL_JOB_NAMES.ORGANIZATION_INVITE:
        await this.sendEmail({
          to: job.data.recipientEmail,
          subject: `${job.data.invitedBy.name} invited you to join ${job.data.organization.name} on Credora`,
          text: `${job.data.invitedBy.name} invited you to join ${job.data.organization.name} on Credora`,
          data: job.data,
          templateName: templateNames.organizationInvite,
        });
        break;

      default:
        throw new Error(`Unhandled email job: ${job.name}`);
    }
  }

  async sendEmail<T>({
    to,
    subject,
    text,
    data,
    templateName,
  }: {
    to: string;
    subject: string;
    text: string;
    data: T;
    templateName: string;
  }) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error('Template not found.');
    }

    const html = template({
      ...data,
      clientUrl: this.clientUrl,
      logoUrl: this.logoUrl,
    });

    try {
      const { messageId } = await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
        text,
      });

      if (!messageId) {
        throw new Error('Failed to send email.');
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error);
    }
  }
}
