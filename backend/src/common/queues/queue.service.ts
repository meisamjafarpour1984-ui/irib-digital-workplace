import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  body: string;
  href?: string;
}

export interface PdfGenerationJobData {
  contentId: string;
  template: string;
  data: Record<string, unknown>;
}

export interface ContentIndexingJobData {
  contentId: string;
  action: 'create' | 'update' | 'delete';
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('emails') private emailQueue: Queue,
    @InjectQueue('notifications') private notificationQueue: Queue,
    @InjectQueue('pdf-generation') private pdfQueue: Queue,
    @InjectQueue('content-indexing') private indexingQueue: Queue,
  ) {}

  async addEmailJob(data: EmailJobData, options?: { delay?: number }) {
    try {
      const job = await this.emailQueue.add('send-email', data, options);
      this.logger.log(`Email job added: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add email job', error);
      throw error;
    }
  }

  async addNotificationJob(data: NotificationJobData, options?: { delay?: number }) {
    try {
      const job = await this.notificationQueue.add('send-notification', data, options);
      this.logger.log(`Notification job added: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add notification job', error);
      throw error;
    }
  }

  async addPdfGenerationJob(data: PdfGenerationJobData, options?: { delay?: number }) {
    try {
      const job = await this.pdfQueue.add('generate-pdf', data, options);
      this.logger.log(`PDF generation job added: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add PDF generation job', error);
      throw error;
    }
  }

  async addContentIndexingJob(data: ContentIndexingJobData, options?: { delay?: number }) {
    try {
      const job = await this.indexingQueue.add('index-content', data, options);
      this.logger.log(`Content indexing job added: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add content indexing job', error);
      throw error;
    }
  }

  async getQueueStats() {
    try {
      const [emails, notifications, pdf, indexing] = await Promise.all([
        this.emailQueue.getJobCounts(),
        this.notificationQueue.getJobCounts(),
        this.pdfQueue.getJobCounts(),
        this.indexingQueue.getJobCounts(),
      ]);

      return {
        emails,
        notifications,
        pdf,
        indexing,
      };
    } catch (error) {
      this.logger.error('Failed to get queue stats', error);
      throw error;
    }
  }
}
