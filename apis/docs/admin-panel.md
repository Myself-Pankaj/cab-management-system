# Admin operations panel

The Next.js `/admin` routes share a protected responsive shell. All reporting APIs
require the existing authenticated Admin role and use the normal API envelope.
The existing ride-offer and driver-review services remain authoritative for mutations.

## Reporting contracts

Paths below are relative to `/api/v1`.

- `GET /admin/dashboard/summary`: aggregate users, vehicles, rides and submitted
  verification counts, three-item recent submission/booking previews and compatible operational previews, and `calculated_at`.
- `GET /admin/users` and `/admin/users/:id`: safe read-only account information. Related bookings use the ride list user filter.
  List filters: `search`, `role`, `accountStatus`.
- `GET /admin/vehicles`: actual fleet inventory with linked driver and document
  review/expiry summaries. Filters: `search`, `activity`, `category`.
- `GET /admin/vehicles/:id` and `PATCH /admin/vehicles/:id`: fleet details and protected, audited updates.
- `GET /admin/payments/:id`: transaction references and the authoritative ride payment summary.
- `GET /admin/payments`: transactions and filtered aggregate collections/status
  counts. Filters: `status`, `paymentType`, inclusive `dateFrom`, exclusive `dateTo`
  using ISO timestamps. The UI date boundaries use Asia/Kolkata midnight.
- `GET /admin/verifications` and `/admin/drivers`: application summaries, filtered
  in SQL before pagination. Filters: `search`, `state`.
- `GET /admin/drivers/pending`: the paginated pending-verification view.
- `GET /admin/rides`: operational ride list with existing status/category filters.

Paginated responses contain `items`, `total`, `limit` (default 20, max 100), and
`offset`, with deterministic creation-time/ID ordering. Ride lists retain `rides`
as a compatibility alias. Driver list and pending-list consumers must use `items`.
OpenAPI and generated RTK Query bindings include these contracts.

Each report reads a repeatable-read, read-only transaction so its rows, counts,
and preview queries see one snapshot. SQL aggregates count records directly.

## Metric definitions

User totals exclude soft-deleted accounts and include inactive/blocked accounts.
A user has one nullable role; unselected roles have their own count. Percentages
use total non-deleted users, return zero for an empty population, and round to two
decimal places. Independent rounding can produce a sum slightly different from 100%.
Vehicle totals include active and inactive records. Driver accounts and driver
profiles are intentionally distinct concepts in the UI.

Today's scheduled rides include every status, including cancellations, with pickup
in the half-open Asia/Kolkata day. Active means CONFIRMED or IN_PROGRESS. Completed
and other lifecycle counts are all-time. A pending current offer past its expiry
is reported as awaiting assignment without changing stored state. Opening its
ride or attempting an assignment invokes the existing lazy expiration service.
The existing lock order, reservation rules and acceptance rechecks are preserved.
Equal or larger vehicle categories can fulfil a booking at its existing fare.
Eligibility checks reservations across all vehicles owned by the driver and keeps
the existing journey duration and 30-minute turnaround buffer.

Pending driver reviews count submitted applications, not drafts. Pending document
counts cover driver and vehicle documents in those applications. Correction requests
are a rejected review with selected correction IDs, not a new database enum.

Payment totals follow the current list filters across all pages. Only PAID records
contribute to online/cash collected amounts; failed, refunded and partially refunded
records have separate counts. These totals do not represent historical gross
collections, refund amounts, or net revenue. The current payment flow uses INR.

## Audit and access

Driver details display existing append-only review audit records, reviewer IDs,
decisions, reasons and timestamps. Ride details display offer creation, response,
release actors/times and ride status history. Mutations continue writing their
existing audit records atomically. No generic user suspension or payment mutation
is introduced. General account/fleet reports omit credentials, authentication
metadata, bank details and document URLs. Document retrieval retains existing
Admin and ownership checks.

The summary refetches on focus or manual refresh. RTK Query invalidation refreshes
relevant reports after local mutations. Other admins' updates become visible on
focus/refresh; no background polling or push infrastructure is added.

## Validation

The schema through migration 022 was validated on disposable PostgreSQL 16, including
rollback/reapplication of 022. The audit/identity infrastructure uses migration 022;
reporting aggregates reuse existing tables. Existing role, ride status/pickup/category,
profile/document status and relation indexes were reviewed; exact all-time counts
still require scans. Do not add speculative indexes without realistic query plans
and workload measurements.

Run `pnpm test test/admin/admin-authorization.spec.ts` for role and query validation.
Run `ADMIN_TEST_DATABASE_URL=<local-url> pnpm test
 test/admin/admin-reporting.integration.spec.ts` against a migrated disposable
`cab_admin_validation` database; each test rolls its fixture writes back.
The existing ride and onboarding integration suites require separate migrated
`cab_driver_test` and `cab_onboarding_test` databases and their documented environment
variables. They cover concurrent assignments, duplicate/expired responses, reservation
release, eligibility changes and audited reviews.

## Administrative editing and document previews

Apply migration `022_admin_operations.sql` before using this release. It adds
persistent mutation receipts, append-only vehicle edit audits, identity snapshots
for new offers/completions, and millisecond-monotonic vehicle update tokens.
Legacy history without snapshots is explicitly labelled as unavailable; identities
are not backfilled from current owners.

Admin confirmations send a UUID `operation_id`. Document decisions/corrections,
profile decisions, suspension, correction requests, assignment/release, cancellation,
and admin completion retain idempotency within their domain transactions. Conflicting
reuse of a key is rejected. Cosmetic vehicle corrections accept an optional reason;
registration/category/activity changes require a reason. Vehicle edits use
`expected_updated_at`; document edits use `expected_revision`.

Vehicle updates lock profile then vehicle, matching assignment. Live pending offers
and unfinished accepted rides block edits with `VEHICLE_EDIT_BLOCKED` and allowlisted
blocking ride/offer IDs. Registration/category changes reset vehicle document reviews
and application review. Admin document metadata corrections increment revisions,
audit before/after values, and reset review in one transaction. Pending application
compliance blocks new assignments; accepted rides are retained and ongoing rides can
finish under the existing financial invariants.

`GET /admin/rides` accepts `userId`, `driverProfileId`, and `view=assigned|completed`.
Assigned includes live offers and unfinished accepted rides. Completed uses completion
records, falling back to unreleased historical accepted offers for legacy rides.
All filtering/counting precedes server pagination. List filters and offsets are kept
in the browser URL; related history uses `ridesView` and `ridesOffset`.

Private uploads support JPEG, PNG, WebP and PDF, up to 10 MB. Vehicle photos remain
image-only. PDF.js and its worker are bundled locally; the viewer renders pages to
canvas without scripts, XFA, attachments, or interactive annotations. Protected
media access rechecks ownership/admin role on each request, including downloads.
Responses use no-store, nosniff and a restrictive sandbox policy. Object URLs are
revoked when replaced or the viewer/session ends. Aadhaar copies must already be
masked; the upload attestation does not automatically verify masking. Existing
private-file quarantine remains in effect, with no public-original fallback.

Payment amounts come from the existing backend summary. PAID-only collection totals
are not net revenue. Refund statuses are displayed separately; exact refunded/net
amounts are unavailable because the existing schema does not store refund amounts.
Cancelled booking balances are not collection instructions. Cancellation retains the
existing provider refund flow; repeated confirmation does not repeat the provider call.
If a provider refund fails after cancellation commits, reconciliation remains necessary.

For database checks, run the new suite with `ADMIN_UPGRADE_TEST_DATABASE_URL` pointing
to a disposable, migrated `cab_admin_upgrade` database. Reporting fixtures require a
separate empty `cab_admin_upgrade_reports` (or the original `cab_admin_validation`)
database via `ADMIN_TEST_DATABASE_URL`. Ride/onboarding regressions also accept
`cab_admin_upgrade_driver` and `cab_admin_upgrade_onboarding` as isolated targets.
Browser checks use fixture responses; they verify layout and interactions separately
from real PostgreSQL authorization, revision, audit, and race tests.
