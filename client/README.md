# Safar Cabs

Next.js App Router, HeroUI v3, and a generated RTK Query client. Fonts and photography are hosted locally.

## Run

```sh
pnpm install
# Optional: copy .env.example to .env.local and adjust the backend origin.
pnpm dev --port 3100
```

Open http://localhost:3100. The backend defaults to http://localhost:8000. Next.js proxies `/api/v1/*` to `API_PROXY_TARGET`, so browser calls and cookies use the frontend origin. Set the server-only origin for your deployment; production must serve HTTPS for the backend's Secure cookies. Restart Next.js after changing proxy configuration.

## Generate API types and hooks

With the backend running:

```sh
pnpm api:generate
```

`OPENAPI_SCHEMA_URL` defaults to `API_PROXY_TARGET` plus `/api/v1/swagger-json`. Next.js env files are loaded by the command. It generates all documented endpoints, request/response types, query and lazy-query hooks, and mutation hooks in `src/store/api/generated/api.ts`, and records the schema in `src/openapi/openapi.json`.

Keep both generated files in version control. Do not hand-edit them. Generation stages both files before replacing working output; normal builds use the existing files and do not contact the backend. Endpoint caching enhancements belong in `src/store/api/enhanced-api.ts`.

## Accounts and sessions

Login supports email or phone plus password. Signup supports Passenger and Rider (backend `Driver`); phone inputs start with `+91`. Signup proceeds to inline email OTP verification, then automatic login. The password is retained only in component memory during verification and cleared on completion, cancellation, or unmount. Resend is available; no OTP is printed in the UI or logs.

The backend sets HttpOnly access and refresh cookies. All browser API requests use `credentials: include`; the app does not read token cookies or persist tokens. A protected 401 starts one shared refresh per store, then retries each original request at most once. Invalid login credentials and public auth requests never trigger recovery. Temporary refresh failures remain recoverable without signing out. Invalid refresh credentials clear cached account data. Logout waits for any active refresh before clearing server cookies.

Profile loads the signed-in user's real account. Public pages remain available when signed out; Profile requires login. The navigation checks the session, distinguishes connection errors from signed-out state, and offers logout. Profile editing and password-reset UI remain outside this step.

## API notifications

A single HeroUI toast provider displays API success and error notifications, including GET requests, guest session checks, token refreshes, and retries. Location suggestions, background profile loads, and session refreshes succeed quietly; their errors still notify. Errors are not grouped or suppressed. Cancelled requests are excluded, and field validation stays inline. Notifications are emitted by the shared base query so internal refresh requests are included too. Success toasts close after 4 seconds and errors after 6 seconds, even while hovered. Expired notifications are cleared when returning to a backgrounded tab. Keyboard-focused toasts remain available until focus leaves, and the close button is always visible.

## Checks

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

No new test cases or testing framework have been added. Font license files are under `public/fonts`; photograph sources are in `public/images/README.md`.

## Passenger booking and cab catalog

Signed-in passengers see journey entry on `/`. Select India-only location suggestions, choose one-way or round-trip dates in IST, then continue to `/booking/cabs` and `/booking/preview`. Locations debounce by 350ms and share a one-request-per-second throttle. In-progress drafts live only in Redux memory; refreshing an unfinished flow returns to journey entry. A completed booking has a persistent `/booking/[id]` URL.

The backend calculates route distance and every fare. Review the final quote before confirming. Price changes require a fresh review; booking retries use the same idempotency key. Bags cannot exceed the category capacity, and requests are notes without extra charges or guarantees. Exactly one passenger is the primary contact. Session termination clears drafts.

Admins manage the four existing categories at `/admin/cabs` (also linked in account navigation). They can edit descriptions, HTTPS image URLs, bag capacities, rates and availability. Seat counts stay fixed; disabled categories disappear from new estimates. Historical booking fares remain unchanged. Images fall back to a local illustration; no image upload is included.

Before running updated APIs, run `pnpm db:migrate:up` and `pnpm db:codegen` in `apis`, then regenerate the client API. Migration `019_passenger_booking_catalog.sql` adds the catalog and booking fields.

Set backend `ORS_API_KEY` for location search and routing. Online/partial payment needs `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. With `NODE_ENV=development`, checkout works on localhost without a webhook: the authenticated verification API checks the completed payment directly with Razorpay. In other environments, also configure the signed webhook at `/api/v1/webhooks/razorpay` with `RAZORPAY_WEBHOOK_SECRET`. Without webhooks, interrupted checkout or a closed browser cannot receive background payment confirmation. Use test-mode credentials for development. No Razorpay secrets belong in frontend environment variables. Offline payment remains available when online payment is unconfigured. The advance percentage uses backend `PARTIAL_ADVANCE_PERCENT` (default 30).

Checkout opens after creating an online/partial booking. The backend verifies the checkout signature, ownership, order and captured amount; the browser callback alone never marks payment paid. Cancellation/failure retains the booking for retry. Delayed confirmation offers a manual status refresh. Payment verification and signed webhooks share transactional, idempotent updates.

## My bookings

Passengers can open `/bookings` from their account navigation or Profile. Upcoming contains all active states (including payment pending/failed and rides in progress); Completed contains completed and cancelled bookings, with their actual status shown. Each tab uses server pagination with 10 bookings per page. Tab and page are in the URL, and the backend derives ownership from the authenticated account. Cards link to full booking, passenger, payment and status-history details. Empty/error states, out-of-range pages, keyboard tabs and mobile pagination are supported. No test cases were added.
