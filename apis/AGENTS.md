# API agent guide

## Scope and working approach

This file applies to `apis/` and its descendants. Paths below are relative to
`apis/` unless stated otherwise. Follow any more specific `AGENTS.md` in the
directory you change.

- Inspect the relevant controller, service, repository, SQL, and tests before
  editing. Follow the existing domain's patterns.
- Check `git status` first. Preserve existing user changes; do not reset, overwrite,
  or reformat unrelated work.
- Make the smallest complete change. Avoid unrelated refactors, new dependencies,
  or new abstractions unless the task needs them.
- Treat current source, package scripts, and configuration as authoritative when
  older README examples disagree. Keep this guide accurate when workflows change.

## Stack and directory map

NestJS with Express, strict TypeScript using NodeNext/ES modules, PostgreSQL via
`pg` and PgTyped, pnpm, Vitest, Oxlint, and Prettier.

| Location                           | Responsibility                                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/main.ts`                      | Bootstrap, `/api/v1` prefix, validation, CORS, cookies, logging, Swagger, schema export         |
| `src/<domain>/`                    | HTTP controllers and application modules                                                        |
| `src/openapi/`                     | Response DTOs and `ApiEnvelope` schema decorator                                                |
| `libs/resources/src/<domain>/`     | Domain modules, services, repositories, DTOs, types, errors, guards                             |
| `libs/resources/src/maps/`         | Location search and routing integration                                                         |
| `libs/core/src/`                   | Configuration, database lifecycle/transactions, logging, response interceptor, exception filter |
| `db/queries/<domain>/*.sql`        | PgTyped query sources                                                                           |
| `db/queries/<domain>/*.queries.ts` | Generated query functions and database types                                                    |
| `db/migrations/`                   | Ordered SQL schema migrations                                                                   |
| `scripts/`                         | Environment loading, migrations, and query generation                                           |
| `test/`                            | Domain, integration, and HTTP tests; some specs are colocated under `src/`                      |

## Architecture and TypeScript

- Keep controllers thin: handle HTTP input, authentication/authorization metadata,
  service calls, and OpenAPI declarations. Put business rules in domain services
  and database access in repositories.
- Use Nest dependency injection. Register new providers/imports/exports in the
  owning module and update library barrel exports when consumers need them.
- Repositories generally extend `BaseRepository`. Prefer the existing PgTyped
  queries over introducing another persistence layer.
- Use `@app/core`, `@app/resources`, and `@db/*` aliases consistently with nearby
  code. Explicit file imports use `.js` extensions even when the source is `.ts`.
- Use `import type` for type-only dependencies. Keep decorated runtime DTOs and
  injected classes available as runtime imports.
- Preserve strict typing. Prefer `unknown` with narrowing over adding `any`,
  broad casts, non-null assertions, or compiler/linter suppressions.
- Follow the existing kebab-case filenames and Nest class naming conventions.
  Prettier uses single quotes and trailing commas. Format changed files only;
  `pnpm format` rewrites all matching source and test files.
- Reuse domain error factories in `types/*-errors.ts` and response mappers in
  `types/*.types.ts` instead of duplicating them.

## HTTP contracts and access control

- Routes live under `/api/v1`. Match existing request and response field names;
  many public fields use `snake_case`.
- Request DTOs use `class-validator`, `class-transformer`, and Swagger decorators.
  Global validation transforms input, strips unknown properties, and rejects
  non-whitelisted input. Add validation and schema metadata for new fields.
- JWT authentication is registered globally in the resource auth module. Use
  `@Public()` only for deliberately public routes. Apply `RolesGuard` and
  `@Roles(...)` where role restrictions are needed; read the identity through
  `@CurrentUser()`.
- Enforce ownership in service/repository operations as well as role access.
  Derive the acting user from authenticated claims, never from a caller-supplied ID.
- Return domain data and let `ResponseInterceptor` produce the standard success
  envelope. Let `GlobalExceptionFilter` produce error envelopes. Avoid double
  wrapping and exposing raw database errors or internal exception details.
- Keep status codes, `ApiEnvelope`, and response DTOs aligned with actual runtime
  output. HTTP contract changes must also update the exported schema and affected
  client bindings when the task includes the client.

## Database changes and generated files

- Edit `.sql` query sources and regenerate `.queries.ts` with `pnpm db:codegen`.
  Do not hand-edit generated query files as the final solution. If generation is
  blocked by database access, report it explicitly.
- Query generation needs a reachable PostgreSQL database with the relevant schema
  applied. Inspect generated diffs for unrelated schema drift.
- Add schema changes in a new migration using the next available numeric prefix
  and the existing `-- +migrate Up` / `-- +migrate Down` markers. Do not rewrite
  migrations already applied to shared environments. Review rollback behavior.
- Parameterize SQL values. Never concatenate user input into SQL; allowlist any
  dynamic SQL identifiers or ordering expressions.
- Use `DatabaseService.withTransaction` for related writes. Pass its `PoolClient`
  through every participating repository call so work stays on one connection.
- Preserve concurrency safeguards, uniqueness constraints, and lock order.
  Transaction callbacks may be retried for transient errors: account for this
  before adding email, payment, upload, or other external side effects.
- Database scripts load `.env.${NODE_ENV}`, defaulting to development. In
  `scripts/load-env.cjs`, database values from that file override shell values.
  Verify the target before migrations; a shell `DB_NAME` override alone is not
  sufficient to select an isolated database.
- Use a disposable/local database for schema validation. Do not run rollback,
  repair, reset scripts, or production migrations unless the task authorizes them.

## Domain rules to preserve

- **Rides:** use `RIDE_STATUS_TRANSITIONS` and `RideStatusService` to validate and
  record transitions. Keep status writes and history records atomic. Preserve
  booking idempotency, passenger validation, category capacity, and ownership checks.
- **Fares:** calculate fares on the server through the existing quote/calculator
  services. Keep decimal database values, numeric API values, rounding, and units
  consistent. INR amounts become paise at the Razorpay boundary.
- **Payments:** preserve checkout/webhook signature checks, raw webhook bodies,
  event deduplication, provider-order ownership, amount/currency checks, and
  protection against duplicate or out-of-order updates. Existing payment update
  flows lock the ride before the payment; maintain that order. Confirm captured
  payment using the provider's verified state.
- **Drivers:** onboarding resumes from saved state. Applications and attached media
  are editable only in `DRAFT` or `REJECTED`. Submission requires a licence, an active vehicle, and RC/PUC/insurance
  documents for each active vehicle. Aadhaar and bank details are optional; Aadhaar
  copies must be masked and numbers limited to their last four digits. Preserve admin review and existing approved-driver behavior.
- **Auth and media:** preserve token/cookie handling, verification rules, and media
  ownership. ImageKit private credentials stay on the server; bank review is manual.

## Configuration and logging

- Use `AppConfigService` and the existing typed config registrations. When adding
  settings, update `env.schema.ts`, the appropriate config factory/interface or
  registration, and `.env.example` as applicable.
- Do not commit credentials or copy private `.env.*` values into code, docs, logs,
  fixtures, or command output. Use placeholders in examples.
- Use `AppLogger` with a service context and the existing sanitization/request
  context utilities. Preserve request ID propagation.
- Do not log passwords, tokens, cookies, authorization headers, payment signatures,
  connection strings, bank/identity documents, or full sensitive request payloads.
- Mock external email, maps, media, and payment providers in automated tests.

## Commands and verification

Run these from `apis/` with pnpm. Install from the existing lockfile using
`pnpm install --frozen-lockfile` when dependencies are needed.

| Command                                             | Purpose / caveat                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| `pnpm dev`                                          | Start Nest in watch mode                                                  |
| `pnpm build`                                        | Compile the API with Nest                                                 |
| `pnpm lint`                                         | Type-aware Oxlint; currently covers `src/` and `test/`, not `libs/`       |
| `pnpm exec prettier --check <changed-files>`        | Check formatting without rewriting files                                  |
| `pnpm test test/rides/ride-booking.service.spec.ts` | Example targeted domain test                                              |
| `pnpm test`                                         | Run `**/*.spec.ts`, including colocated specs and optional DB integration |
| `pnpm test:e2e`                                     | Run `**/*.e2e-spec.ts` separately                                         |
| `pnpm test:cov`                                     | Collect Vitest coverage when relevant                                     |
| `pnpm docker:up`                                    | Start local Compose services when needed                                  |
| `pnpm db:migrate:up`                                | Apply pending migrations to the selected database                         |
| `pnpm db:codegen`                                   | Generate PgTyped files against the selected database                      |

- Add or update behavior-focused tests for changed business rules and bug fixes.
  Cover applicable validation, authorization/ownership, failure, and retry/duplicate
  cases. Follow existing Vitest mocks and Nest testing-module patterns.
- Start with affected tests. For runtime changes, run the build, lint, and relevant
  suites; broaden testing when shared infrastructure or contracts change. Docs-only
  edits do not require application tests.
- `test/db.integration.spec.ts` skips unless `DB_HOST` is set and reads connection
  settings directly from the process environment. Do not claim database behavior
  was verified by a skipped or mocked test.
- For HTTP DTO/response changes, run `pnpm build`, then `pnpm openapi:export`.
  Export writes `../client/src/openapi/openapi.json`; it needs valid configuration
  but does not listen for HTTP requests or initialize the database connection.
  If client bindings are in scope, read `../client/AGENTS.md` and run
  `pnpm --dir ../client api:generate`. Inspect all generated diffs.
- Report what changed, which checks ran and their results, and any blocked checks
  or remaining risks. Distinguish pre-existing failures from regressions. Never
  claim a command passed unless it actually ran successfully.
