/* @name EnqueueMediaCleanup */
INSERT INTO media_cleanup_jobs(file_id) VALUES(:fileId!) ON CONFLICT(file_id) DO NOTHING;
/* @name ClaimMediaCleanup */
UPDATE media_cleanup_jobs SET leased_until=NOW()+INTERVAL '5 minutes'
WHERE file_id IN (
 SELECT file_id FROM media_cleanup_jobs WHERE available_at<=NOW()
 AND (leased_until IS NULL OR leased_until<NOW())
 ORDER BY available_at LIMIT 20 FOR UPDATE SKIP LOCKED
) RETURNING file_id, attempts;
/* @name MediaFileReferenced */
SELECT EXISTS(SELECT 1 FROM images WHERE imagekit_file_id=:fileId!) AS referenced;
/* @name FinishMediaCleanup */
DELETE FROM media_cleanup_jobs WHERE file_id=:fileId!;
/* @name RetryMediaCleanup */
UPDATE media_cleanup_jobs SET attempts=attempts+1, leased_until=NULL,
available_at=NOW()+make_interval(secs=>LEAST(3600,60*power(2,LEAST(attempts,6)))::integer)
WHERE file_id=:fileId!;
