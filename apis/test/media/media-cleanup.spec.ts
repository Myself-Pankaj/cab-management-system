import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaCleanupService } from '../../libs/resources/src/media/services/media-cleanup.service.js';
describe('Durable media cleanup', () => {
  const jobs = {
    enqueue: vi.fn(),
    referenced: vi.fn(),
    finish: vi.fn(),
    retry: vi.fn(),
    claim: vi.fn(),
  };
  const provider = { deleteFile: vi.fn(), stagedFiles: vi.fn() };
  const logger = { errorWithMetadata: vi.fn() };
  const service = new MediaCleanupService(
    jobs as never,
    provider as never,
    logger as never,
  );
  beforeEach(() => {
    vi.resetAllMocks();
    jobs.referenced.mockResolvedValue(false);
    jobs.claim.mockResolvedValue([]);
    provider.stagedFiles.mockImplementation(async function* () {
      yield { fileId: 'orphan' };
    });
  });
  it('does not delete a file still referenced by another record', async () => {
    jobs.referenced.mockResolvedValue(true);
    await service.processFile('shared');
    expect(provider.deleteFile).not.toHaveBeenCalled();
    expect(jobs.finish).toHaveBeenCalledWith('shared');
  });
  it('removes the job after provider deletion succeeds', async () => {
    await service.processFile('old');
    expect(provider.deleteFile).toHaveBeenCalledWith('old');
    expect(jobs.finish).toHaveBeenCalledWith('old');
  });
  it('retries failed provider deletion instead of dropping the job', async () => {
    provider.deleteFile.mockRejectedValue(new Error('Provider unavailable'));
    await service.processFile('old');
    expect(jobs.retry).toHaveBeenCalledWith('old');
    expect(jobs.finish).not.toHaveBeenCalled();
  });
  it('treats already deleted files as successful cleanup', async () => {
    provider.deleteFile.mockRejectedValue({ statusCode: 404 });
    await service.processFile('old');
    expect(jobs.finish).toHaveBeenCalledWith('old');
  });
  it('recovers staged unreferenced uploads through reconciliation', async () => {
    await service.reconcile();
    expect(jobs.enqueue).toHaveBeenCalledWith('orphan');
    jobs.enqueue.mockClear();
    jobs.referenced.mockResolvedValue(true);
    await service.reconcile();
    expect(jobs.enqueue).not.toHaveBeenCalled();
  });
  it('never queues a deletion when reference lookup fails', async () => {
    jobs.referenced.mockRejectedValue(new Error('Database unavailable'));
    await expect(service.reconcile()).rejects.toThrow();
    expect(jobs.enqueue).not.toHaveBeenCalled();
  });
  it('does not fail an upload response if orphan cleanup is temporarily unavailable', async () => {
    jobs.enqueue.mockRejectedValue(new Error('Database unavailable'));
    await expect(service.discard('new')).resolves.toBeUndefined();
    expect(logger.errorWithMetadata).toHaveBeenCalled();
  });
});
