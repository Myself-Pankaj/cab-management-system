import {
  Injectable,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common';
import type { PoolClient } from 'pg';
import { AppLogger } from '@app/core';
import { MediaCleanupRepository } from '../repositories/media-cleanup.repository.js';
import { ImageKitService } from './imagekit.service.js';

@Injectable()
export class MediaCleanupService implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private lastReconciliation = 0;
  constructor(
    private readonly jobs: MediaCleanupRepository,
    private readonly provider: ImageKitService,
    private readonly logger: AppLogger,
  ) {}
  onModuleInit() {
    if (process.argv.includes('--export-openapi')) return;
    this.timer = setInterval(() => {
      void this.tick();
    }, 60000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  enqueue(fileId: string, client?: PoolClient) {
    return this.jobs.enqueue(fileId, client);
  }
  private report(error: unknown) {
    this.logger.errorWithMetadata(
      'Media cleanup needs retry',
      error instanceof Error ? error : new Error('Media cleanup failed'),
      {},
      'MediaCleanupService',
    );
  }
  async discard(fileId: string) {
    try {
      await this.jobs.enqueue(fileId);
      await this.processFile(fileId);
    } catch (error) {
      this.report(error);
    }
  }
  async processFile(fileId: string) {
    if (await this.jobs.referenced(fileId)) {
      await this.jobs.finish(fileId);
      return;
    }
    try {
      await this.provider.deleteFile(fileId);
      await this.jobs.finish(fileId);
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'statusCode' in error &&
        error.statusCode === 404
      ) {
        await this.jobs.finish(fileId);
        return;
      }
      await this.jobs.retry(fileId);
      this.report(error);
    }
  }
  async reconcile() {
    for await (const file of this.provider.stagedFiles()) {
      if (!(await this.jobs.referenced(file.fileId)))
        await this.jobs.enqueue(file.fileId);
    }
  }
  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      if (Date.now() - this.lastReconciliation >= 3600000) {
        try {
          await this.reconcile();
          this.lastReconciliation = Date.now();
        } catch (error) {
          this.report(error);
        }
      }
      for (const job of await this.jobs.claim())
        await this.processFile(job.file_id);
    } catch (error) {
      this.report(error);
    } finally {
      this.running = false;
    }
  }
}
