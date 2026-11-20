# Driver onboarding and ride operations

Drivers enter `/driver` after login. Draft/rejected applications resume onboarding;
pending applications show review status. Approved drivers see assigned, active,
completed, cancelled and rejected rides plus their offer history. Suspended drivers
can read history; an administrator resolves outstanding assignments.

## Rollout

1. Set `DOCUMENT_ENCRYPTION_KEY` to a persistent random 32-byte secret encoded as
   64 hex characters, and configure the existing ImageKit credentials. Back up the target database and apply migrations through `021_onboarding_corrections.sql`
   with the existing migration runner. Existing ride assignments are backfilled.
2. Before making document screens available, run
   `node scripts/migrate-private-documents.cjs` against the intended environment
   to inspect the count. Run with `--apply` to privatize legacy ImageKit assets and replace usable ones with encrypted copies,
   confirm cache invalidation, and flag unavailable images for resubmission.
   The application quarantines legacy document rows until this succeeds.
   Verify ImageKit private access also denies any previously used transformed URLs;
   purge those variants at the provider before release. The script purges stored originals and deletes plaintext originals after encrypted replacement.
3. Existing Aadhaar assets stay quarantined and are marked rejected. Optional replacement
   copies must be masked. Full Aadhaar numbers are reduced to their last four digits.
   Admin reviewers must check that optional Aadhaar copies are masked before approving them.
4. Existing approved drivers need approved licence/RC/PUC/insurance images before new
   assignments. Admin can use “Return for updated documents” to reopen an incomplete approved application;
   preserved in-progress rides remain available for admin resolution.
5. Build/export OpenAPI and regenerate the client, then deploy API and client together.
   Provider credentials and the document encryption key remain server-side.
   Back up the encryption key securely: losing it makes documents unreadable. Test private document viewing with an owner,
   reviewer and unrelated account before enabling real onboarding.

The migration script defaults to `.env.development`, like the existing scripts; select
`NODE_ENV` deliberately. No production migration or provider migration was run by this feature's tests.

## Operations

### Onboarding and corrections

- Onboarding has Vehicle, Documents, and Review & Submit steps. Drivers register
  one vehicle, save details/photos, and edit the same record. Fixed document slots
  replace repeat upload forms. Required documents are licence, RC, PUC, and insurance;
  masked Aadhaar and bank details remain optional. Every active vehicle needs a photo.
- `application_status` is derived from verification history. Drafts can edit vehicle
  and documents; pending/approved applications are read-only. Rejected applications
  can change only the selected rejected documents. `can_edit_vehicle`, `can_submit`,
  `ride_eligible`, and `ride_eligibility_reason` expose the server's current permissions.
- Each rejected verification stores its `correction_document_ids`; legacy rejected
  applications without a selection cannot edit or resubmit until admin specifies one.
  Document review requires `expected_revision`. A rejection also requires a reason,
  `correction_mode` (`IMAGE`, `METADATA`, or `BOTH`), and `metadata_fields` when relevant
  (`document_number`, `expiry_date`). Licence expiry is now supported. Metadata-only
  rejection requires an existing valid image. Returning an application requires at
  least one document with structured correction requirements.
- Editing an existing document requires `expected_revision`, including private-image
  uploads to `/media/documents/upload`. Use the revision returned by the metadata save
  for a subsequent image upload; successful uploads return `document_revision`.
  Stale revisions return 409. Rejected documents retain their reason until every
  selected field differs from its rejected value and any required image is replaced.
  Completed corrections become pending, while previously approved documents stay approved.
- Private document images replace previous images atomically. New uploads occur outside
  database transactions; attachment rechecks ownership, application state, and revision
  under the profile lock. A submitted application cannot receive a late attachment.
  Repeated pending submission returns the existing review. Concurrent vehicle creation
  is serialized by that same lock.
- Admin can reopen an approved application by selecting/rejecting documents first,
  then using Return for updated documents. Approved driver identity is preserved.
  Mandatory-document corrections pause assignment, acceptance, and ride starts until
  approved again; optional-only corrections preserve eligibility. Drivers can finish
  an already-started ride. Explicit account suspension still requires admin resolution.
- Legacy multi-vehicle profiles remain read-only for onboarding pending admin resolution;
  no historical vehicles or approvals are deleted. Older rejected applications without
  correction selections must have documents selected by admin before drivers can edit.
- Vehicle photos remain standard ImageKit assets via
  `POST /api/v1/media/vehicles/:vehicleId/photos` with `content_base64` (JPEG, PNG, WebP,
  up to 10 MB decoded). They can be changed only in a draft. Compliance documents use
  encrypted private storage; do not place identity documents in vehicle photos.

### Media cleanup

Migration 021 adds document correction state/revisions, licence expiry, audit details,
and `media_cleanup_jobs`. It must be deployed before this API/client version. Migration
files are prepared without migrating the development database during implementation.

A lifecycle worker checks the durable cleanup queue every minute, with leases for
multiple API instances. Provider errors retry from one minute up to one hour; missing
files count as successful deletion. Each deletion first checks all image references.
Queued provider files cannot be attached again while cleanup is in progress.

New media uploads carry `cab-media-staged-v1`. Hourly reconciliation scans tagged files
older than 24 hours and queues only unreferenced assets, recovering provider success
followed by database failure or process termination. Failed database/reference checks
skip deletion. Monitor `MediaCleanupService` errors and queue attempts/available times;
provider secrets and document contents are never logged.

- `DRIVER_OFFER_EXPIRY_MINUTES` defaults to 30. Offers expire no later than pickup.
  No worker is required: reads display effective expiry; assignment/action requests
  release expired reservations transactionally. Admin detail refresh also materializes expiry.
- Pending offers reserve both driver and vehicle. One-way reservation end is pickup plus
  driving duration plus 30 minutes; round-trip end is return-journey start plus half the
  total driving duration plus 30 minutes. Endpoints are half-open. An in-progress ride
  blocks further use until resolved, even after its estimated end.
- Driver accept/reject references the offer ID. Admin revocation also handles accepted,
  unstarted offers when a release reason is supplied. Acceptance history is preserved.
- Start and completion require current ownership. Suspension blocks mutations and admin
  can release unstarted assignments or complete in-progress rides with a collection note.
- Completion requires a UUID operation ID, expected outstanding amount and declared cash
  amount in INR. Both amounts must equal the server balance. Collection declaration,
  payment settlement, ride completion and history share one transaction. Repeating a
  successful completion returns its existing declaration, with no additional payment.
- Generic admin status updates cannot complete rides. The legacy mark-paid endpoint is
  deprecated and rejects requests; use the audited completion endpoint.
- Rejection, expiry and revocation do not cancel a passenger booking or alter payments.
  Booking cancellation revokes a pending offer or annotates an accepted one and follows
  the existing refund behavior.

## Validation

Run `pnpm test`, `pnpm exec tsc --noEmit --declaration false`, `pnpm build`, and `pnpm lint`
from `apis/`. Database integration tests require `DRIVER_TEST_DATABASE_URL` pointing to a
**disposable database named `cab_driver_test`** with all migrations applied. They create
fixtures in that database and deliberately refuse any other database name.

Onboarding integration tests require `ONBOARDING_TEST_DATABASE_URL` pointing to a
**disposable database named `cab_onboarding_test`**, with migrations through 021 applied.
They refuse other database names and exercise real profile locks, concurrent creation,
idempotent submission, selective corrections, upload races, and image replacement.
Run `pnpm test test/drivers/onboarding.integration.spec.ts` with that variable set.

Run the client lint, type check and production build from `client/`. Generated bindings
can consume an exported schema without a running API:
`OPENAPI_SCHEMA_URL=file:///absolute/path/client/src/openapi/openapi.json pnpm api:generate`.

Cash receipt is a recorded driver declaration, not independently verified evidence of
payment. Partial cash collection, fare adjustments, automatic dispatch, document renewal,
and live tracking remain outside v1.

Document bytes use AES-256-GCM before upload. The authenticated backend decrypts them
for authorized viewing. This also protects against named transformations serving private
files ([ImageKit security documentation](https://imagekit.io/docs/media-delivery-basic-security)).
