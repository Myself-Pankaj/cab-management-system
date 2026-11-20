# Production UI upgrade

The existing homepage composition remains the visual reference. The old Vite client was inspected for card depth, imagery, supporting information and interaction details. Its fare calculations, vehicle-selection model and policy text were not copied.

## Gap analysis and implemented changes

| Area | Gap identified | Implementation |
| --- | --- | --- |
| Shared design | Different brand accents and presentation across roles | Operational tokens for colors, typography, surfaces, spacing, radii, shadows and motion; orange Admin accent |
| Shared states | Text-only loading and repeated error/empty markup | Reusable skeletons, query states, semantic status badges, detail lists, metric cards and pagination |
| Homepage | Booking described as unavailable | Updated availability copy; existing layout, photographs and homepage token values retained |
| Login/signup/OTP | API failures disappear with toast dismissal | Inline error feedback alongside the existing notification pipeline, busy semantics and readable form guidance |
| Profile | Limited role-specific onward navigation | Account shortcuts for booking, driver documents/workspace or administration; loading skeleton |
| Journey entry | Form lacks contextual hierarchy | Section heading, location icons and instructions, native date/time hints in IST |
| Category selection | Basic capacity labels and implicit example imagery | Richer seat/bag facts, category-specific action labels, visible image disclaimer and skeleton/error/empty states |
| Booking review | Estimate and reviewed total look alike | Explicit fare-review badge, reviewed-total label and selected traveller/bag summary; existing payment breakdown retained |
| Booking detail | Ride and payment statuses blend together | Separate semantic badges, recorded-balance wording for cancellation, transaction badges and detail skeleton |
| My Bookings | Different statuses have similar visual weight | Shared badges and status-specific card accents; server grouping, URL state, counts and pagination retained |
| Driver dashboard | Assignment list lacks overview/context | Real profile/eligibility summaries, selected-view server total, separate offer/ride statuses, route and IST schedule details |
| Driver onboarding | Readiness and corrections require scanning forms | Readiness checklist, shared application/document statuses, clearer document formats and query recovery states |
| Vehicle information | Broken photos have no fallback; removal is immediate | Reserved photo dimensions, unavailable-image fallback and explicit removal confirmation |
| Driver ride detail | Admin presentation dependency and immediate actions | Role-neutral shared presentation and confirmations for acceptance, rejection, start and completion; rejection data captured before awaiting confirmation |
| Admin overview | Visually separate KPI system | Shared metric cards with existing real reporting totals and destination links |
| Admin lists | Plain filters, cramped rows and inconsistent result states | Styled toolbars, active-filter summary/reset, larger controls, shared pagination, focusable contained tables and query states |
| Admin record details | Disconnected detail styling | Shared semantic badges and grouped detail lists; consistent operational panels and financial typography |
| Private documents | Limited loading/recovery feedback | Loading skeleton, retry action and announced zoom level; authorization, fresh downloads and object-URL cleanup retained |
| Cab settings | Image edits have no immediate preview | Preview follows the image field, explicit category-image context and grouped capacity/pricing fields |

## Compatibility and API boundaries

- No backend files, migrations, generated API files, endpoint definitions, dependencies or public routes were changed for this upgrade.
- The category booking model, server quotes, booking idempotency, payment verification, refresh/session handling and cache behavior remain in the existing implementation.
- Operational summaries use real response fields. Driver totals describe only the selected server view; displayed schedule information describes only visible records.
- No wallet/earnings API was found in the generated client. Wallet/earnings UI is omitted. Cross-view driver analytics, unsupported search/sort, policy promises and unavailable refund amounts are not fabricated.
- Admin search and filters retain their existing server contracts and URL state. Private financial records remain read-only.
- Shared confirmation presentation retains admin reasons and operation IDs; Driver confirmation does not add a reason requirement to its API calls.

## Executed verification

- Baseline lint, TypeScript and three vehicle/photo retry tests passed before editing. The initial sandbox build stalled; production builds subsequently passed outside the sandbox.
- Final lint and TypeScript checks, production build and vehicle/photo retry tests are recorded in the completion report.
- Production HTTP smoke checks returned 200 with the application shell for 25 public/account/Passenger/Driver/Admin routes, including representative dynamic routes. These checks do not authenticate, hydrate or exercise protected business operations.
- Shared normal-text contrast checks: body 15.58:1, secondary text 6.16:1, primary button 5.52:1, success 6.77:1, warning 6.81:1, danger 6.47:1, neutral 7.28:1.
- Responsive rules cover narrow page containers, stacked review panels, wrapping toolbars, stacked onboarding navigation, contained table scrolling and reduced motion. These were inspected in source; no browser screenshots or computed layout assertions were available.

## Manual browser acceptance still required

Use development accounts and payment test credentials. Do not treat HTTP smoke tests as end-to-end coverage.

- At 360, 768, 1280 and 1440 px: inspect long addresses, document names, empty/error results, image fallbacks, card spacing and contained table scrolling. Confirm the public homepage composition is unchanged.
- With keyboard navigation: exercise location suggestions, tabs, table scroll regions, file controls and every confirmation. Verify focus entry, Escape/cancel, return to the trigger and no mutation on cancellation. Enable reduced motion.
- Passenger: one-way/round-trip validation, category capacity, passenger primary contact, quote changes, all three payment choices, payment interruption/failure/retry, server-confirmed payment, booking history and draft reset.
- Driver: create/edit vehicle, partial photo upload retry, cancel/confirm photo removal, required documents, rejection/correction restrictions, submission, suspension/eligibility, offer expiry, accept/reject, start and cash declaration/completion.
- Admin: URL filters/pagination/reset, record links, private PDF/image retry/zoom/download, verification/correction reasons, vehicle edits, assignment/revocation/cancellation and payment inspection.
- Accounts: signup/OTP/resend/login errors, wrong-role access, anonymous redirect, expired-session recovery and logout. No new account-edit or password-reset flow was added.
