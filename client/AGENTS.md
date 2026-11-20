# AGENTS.md — Ride Booking Application

## 1. Project Overview

This repository contains a ride-booking application built with Next.js and TypeScript.

The application has three primary roles:

- **Admin**
- **Passenger**
- **Driver**

The intended technology stack includes:

- Next.js with App Router
- TypeScript
- Redux Toolkit
- RTK Query
- OpenAPI-based RTK Query code generation

Other technologies, including styling, authentication, validation, maps, payments, and real-time communication, must be identified from the actual repository.

**Important:** Never assume that a feature, API, database table, package, or architectural component exists without inspecting the codebase.

This document defines engineering standards, not the current feature inventory.

---

## 2. Core Engineering Principles

Every implementation must follow these principles:

1. Write clean, readable, maintainable code.
2. Follow the existing project architecture.
3. Reuse existing functionality before writing new code.
4. Keep implementations simple.
5. Avoid unnecessary abstractions.
6. Avoid duplicate code and business logic.
7. Maintain strong TypeScript typing.
8. Separate UI, state management, and business logic.
9. Preserve existing functionality.
10. Prioritize security, reliability, and performance.
11. Remove unnecessary code when safe.
12. Avoid introducing dependencies without justification.
13. Verify changes before claiming completion.

**Golden Rule: Inspect first, reuse what exists, implement the smallest correct solution, and verify the result.**

---

## 3. Mandatory Repository Inspection

Before modifying code:

1. Inspect the existing directory structure.
2. Read `package.json`.
3. Identify the installed Next.js, React, Redux Toolkit, and TypeScript versions.
4. Inspect relevant configuration files.
5. Identify the routing structure.
6. Examine authentication and authorization patterns.
7. Inspect the Redux store configuration.
8. Examine the RTK Query base API.
9. Inspect the OpenAPI code-generation configuration.
10. Identify existing shared components, hooks, utilities, and feature modules.
11. Review relevant tests and existing implementations.

Never create an alternative architecture without understanding the current one.

If actual code differs from this document, treat the implemented code as the baseline and report significant inconsistencies.

Do not rewrite existing modules merely to make them match an example directory structure.

---

## 4. Project Architecture

Prefer a feature-based architecture with clear separation of responsibilities.

Recommended organization:

```text
src/
├── app/
│   ├── (auth)/
│   └── (dashboard)/
│       ├── admin/
│       ├── passenger/
│       └── driver/
│
├── features/
│   ├── auth/
│   ├── booking/
│   ├── rides/
│   ├── drivers/
│   ├── passengers/
│   ├── payments/
│   ├── location/
│   └── notifications/
│
├── components/
│   ├── ui/
│   ├── layouts/
│   └── shared/
│
├── store/
│   ├── store.ts
│   ├── provider.tsx
│   ├── hooks.ts
│   ├── api/
│   │   ├── base-api.ts
│   │   ├── generated/
│   │   └── enhanced-api.ts
│   └── slices/
│
├── hooks/
├── lib/
├── config/
├── constants/
└── types/
```

This is a reference structure, not a requirement to create every directory.

### Architectural Responsibilities

**`app/`**

- Routes
- Pages
- Layouts
- Loading and error boundaries
- Route-level composition

**`features/`**

- Feature-specific components
- Domain-specific hooks
- UI orchestration
- Feature validation
- Feature-specific utilities

**`components/`**

- Shared presentational components
- Reusable form controls
- Common dialogs
- Shared layouts

**`store/`**

- Redux configuration
- RTK Query API infrastructure
- OpenAPI-generated endpoints
- Global client state where necessary

**`lib/`**

- Shared infrastructure
- Cross-feature utilities
- Authentication helpers

Do not mix unrelated responsibilities.

---

## 5. OpenAPI and RTK Query — Mandatory Rules

The application uses RTK Query OpenAPI code generation.

**OpenAPI is the source of truth for API contracts.**

Generated API definitions must be treated as generated code.

### Generated Code Rules

1. Never manually edit generated API files.
2. Never manually duplicate generated request types.
3. Never manually duplicate generated response types.
4. Prefer generated query and mutation hooks.
5. Use existing generated endpoints before defining new ones.
6. Regenerate API code after relevant OpenAPI contract changes.
7. Do not invent endpoints, parameters, or response fields.
8. Do not bypass the generated API layer without a justified requirement.
9. Avoid creating a separate API client for each role.
10. Follow existing endpoint naming and generation conventions.

Generated files should remain isolated under the existing generated-code directory.

### Base API

The base API is responsible for shared API configuration, where applicable:

- Base URL
- Common request configuration
- Authentication header integration
- Shared error handling
- Standard request behavior

Do not create multiple equivalent base API implementations.

### Generated API

Generated files provide:

- Endpoint definitions
- Query hooks
- Mutation hooks
- Request types
- Response types

Do not write handwritten equivalents unnecessarily.

### Enhanced API

Use the supported RTK Query endpoint-enhancement mechanism for behavior such as:

- Cache tags
- Cache invalidation rules
- Endpoint-specific caching configuration
- Other supported endpoint enhancements

Keep enhancements separate from generated code.

Avoid recreating generated endpoints solely to customize caching.

### Regeneration

Use the existing generation command defined in `package.json`.

If no generation command exists, inspect the installed generator and project configuration before introducing one.

Never manually change generated output to resolve a contract mismatch.

Fix the source contract or generation configuration instead.

---

## 6. TypeScript Type Management

Use generated OpenAPI types whenever possible for API data.

Rules:

- Import API types from the generated output.
- Avoid redefining API DTOs.
- Avoid `any`.
- Use `unknown` for values requiring validation.
- Avoid unsafe type assertions.
- Handle nullable and optional values.
- Use discriminated unions where appropriate.
- Keep component props typed.
- Avoid suppressing TypeScript errors.

Frontend-only types may be defined separately.

Examples include:

- Component props
- UI state
- Local form values
- Presentation-specific view models

Do not treat frontend-only types as replacements for API contracts.

---

## 7. Redux Toolkit and State Management

Use Redux Toolkit according to the existing architecture.

### RTK Query

Use RTK Query for server state:

- API data fetching
- API mutations
- Request caching
- Loading states
- Error states
- Cache invalidation
- Refetching

Do not unnecessarily copy RTK Query server data into Redux slices.

### Redux Slices

Use Redux slices for genuinely shared client-side state that requires them.

Examples:

- Global UI preferences
- Shared temporary application state
- Other cross-feature client state

Do not create a Redux slice for every feature automatically.

### Component State

Use component-local state for simple UI behavior.

Examples:

- Dialog visibility
- Input state
- Local selection
- Temporary UI interactions

### Next.js Store Management

When using Next.js App Router:

- Follow the established per-request Redux store pattern.
- Avoid global singleton stores on the server.
- Use a Client Component provider for client-side Redux access.
- Do not access React Redux hooks from Server Components.
- Avoid using Redux as an unnecessary replacement for server-side rendering.

Maintain correct store initialization and lifecycle behavior.

---

## 8. RTK Query Cache Management

Cache correctness is important for ride-booking workflows.

Rules:

1. Define cache tags according to actual API resources.
2. Invalidate relevant data after successful mutations.
3. Avoid unnecessary broad cache invalidation.
4. Prevent duplicate API requests.
5. Avoid manual refetching when cache invalidation already handles it.
6. Use appropriate polling only where required.
7. Avoid stale ride and driver availability information.
8. Consider optimistic updates only when rollback behavior is safe.
9. Preserve consistency after booking, cancellation, and ride-status changes.
10. Avoid maintaining multiple conflicting sources of server state.

Never use arbitrary polling intervals without evaluating their impact.

---

## 9. Role-Based Architecture

The application supports:

- Admin
- Passenger
- Driver

Keep role-specific pages and workflows separate while sharing common domain functionality.

### Admin

Administrative operations must require proper backend authorization.

### Passenger

Passenger operations must validate access to the appropriate user resources.

### Driver

Driver operations must validate access to assigned or otherwise authorized resources.

### Shared Business Logic

Reuse common logic where behavior is identical.

Examples:

- Ride status presentation
- Booking information
- Authentication utilities
- Notification UI
- Currency formatting
- Location formatting

Avoid creating three implementations of the same functionality merely because three roles use it.

However, do not force substantially different workflows into one complicated component.

---

## 10. Authentication and Authorization

Authentication and authorization are separate concerns.

**Authentication:** Identify the current user.

**Authorization:** Determine what actions the user can perform.

Security requirements:

1. Validate protected API operations on the backend.
2. Never trust a role submitted by the frontend.
3. Never use client-side guards as the only authorization boundary.
4. Check access to sensitive resources.
5. Avoid exposing access tokens or secrets.
6. Follow existing secure session-management patterns.
7. Protect sensitive route handlers and server actions.
8. Avoid logging credentials or authentication tokens.
9. Handle expired sessions consistently.
10. Avoid authorization and redirect loops.

Do not introduce a new authentication library when an existing system already satisfies requirements.

---

## 11. Next.js App Router Guidelines

Follow the conventions of the installed Next.js version.

### Server Components

Prefer Server Components for appropriate server-rendered functionality.

Avoid unnecessarily converting whole pages or layouts into Client Components.

### Client Components

Use Client Components for:

- RTK Query hooks
- Redux hooks
- Browser APIs
- Interactive UI
- Client-only functionality

Keep `"use client"` boundaries focused.

### Routing

- Keep route definitions consistent.
- Preserve relevant URL parameters.
- Avoid hardcoded route strings scattered throughout the application.
- Prevent redirect loops.
- Maintain predictable Back navigation.
- Handle invalid destinations.
- Avoid unnecessary route replacements.

### Loading and Errors

Implement suitable:

- Loading states
- Error states
- Empty states
- Not-found handling
- Unauthorized handling

Never silently hide failures.

---

## 12. Feature Organization

Organize functionality by domain rather than scattering it across role-specific pages.

For example:

```text
features/
└── booking/
    ├── components/
    ├── hooks/
    ├── schemas/
    ├── utils/
    └── index.ts
```

### Rules

- Keep feature-specific UI inside its feature module.
- Keep common UI in shared components.
- Reuse generated RTK Query hooks.
- Avoid unnecessary service wrappers around generated API hooks.
- Keep complex presentation transformations outside JSX.
- Avoid circular dependencies between features.
- Avoid importing private internals from unrelated features.
- Extract shared logic only when needed.

Do not create empty files or directories to satisfy a template.

---

## 13. Ride Booking Domain Rules

Ride booking involves stateful workflows and potentially concurrent operations.

When modifying ride-related functionality:

1. Inspect existing ride states.
2. Validate allowed state transitions.
3. Respect booking ownership and permissions.
4. Handle duplicate operations.
5. Consider concurrent booking attempts.
6. Prevent invalid assignment actions.
7. Handle stale availability information.
8. Validate server-authoritative pricing.
9. Handle cancellation safely.
10. Maintain consistency after mutations.

### Shared and Private Rides

The application may support shared and private rides.

When implementing these workflows:

- Reuse genuinely common functionality.
- Keep different booking rules explicit.
- Avoid duplicating unrelated code.
- Do not assume the same pricing or availability rules apply.
- Follow the actual product requirements and existing implementation.

Do not invent ride states, pricing rules, seat-allocation logic, or cancellation policies.

---

## 14. Real-Time Features

Ride-booking applications may require real-time functionality.

Examples include:

- Driver locations
- Ride status updates
- Booking requests
- Live trip progress

If real-time infrastructure exists:

- Reuse it.
- Avoid duplicate subscriptions.
- Clean up connections and listeners.
- Handle reconnects correctly.
- Handle stale events.
- Respect user authorization.
- Avoid unnecessary high-frequency state updates.
- Avoid excessive polling.

Do not add Socket.IO, WebSockets, or another real-time technology unless required.

---

## 15. Component Design

Follow reusable component principles.

Rules:

- Keep components focused.
- Prefer composition.
- Avoid oversized components.
- Keep complex business logic outside JSX.
- Reuse existing UI components.
- Use semantic HTML.
- Support keyboard accessibility.
- Provide appropriate accessible labels.
- Maintain responsive layouts.
- Avoid excessive prop drilling.
- Avoid unnecessary abstraction.

Do not build a generic reusable component when a simple local component is clearer.

---

## 16. Styling and UI Consistency

Follow the existing styling system.

Do not assume the project uses Tailwind CSS, shadcn/ui, or another component library unless installed.

Maintain consistency in:

- Typography
- Spacing
- Colors
- Buttons
- Inputs
- Forms
- Dialogs
- Navigation
- Loading indicators
- Error messages
- Empty states

Use existing design tokens and shared components.

Avoid introducing competing styling approaches.

---

## 17. Forms and Validation

Maintain consistent validation across the application.

Rules:

1. Reuse existing form libraries and schemas.
2. Validate user input.
3. Handle form errors.
4. Prevent unintended duplicate submissions.
5. Display submission progress.
6. Preserve form values when appropriate.
7. Separate form values from API DTOs where needed.
8. Map form values to generated API request types explicitly.
9. Validate sensitive information on the backend.
10. Avoid trusting client-calculated amounts.

Do not introduce a new form-validation library without a clear need.

---

## 18. Performance Guidelines

Prioritize practical performance improvements.

Focus on:

- Avoiding duplicate API requests
- Efficient RTK Query caching
- Preventing unnecessary React renders
- Reducing client-side JavaScript
- Optimizing large lists
- Appropriate pagination
- Efficient image handling
- Avoiding unstable effect dependencies
- Preventing memory leaks
- Cleaning up subscriptions
- Reducing unnecessary location updates

Measure complex performance problems before introducing significant optimization changes.

Do not add caching layers merely because they might be useful later.

---

## 19. Error Handling

Handle errors consistently.

- Use existing error-handling utilities.
- Show understandable error messages.
- Preserve useful operational context.
- Avoid exposing sensitive backend details.
- Distinguish authentication failures from authorization failures.
- Avoid swallowing exceptions.
- Provide recovery paths when appropriate.
- Do not report failed mutations as successful.

When working with RTK Query, use its established error and mutation-state handling patterns.

---

## 20. Dependency Management

Before adding a library:

1. Inspect existing dependencies.
2. Determine whether existing functionality already solves the problem.
3. Check compatibility with installed versions.
4. Consider maintenance cost.
5. Consider bundle size.
6. Avoid overlapping libraries.

Prefer fewer dependencies where functionality and maintainability are equivalent.

---

## 21. Code Quality and Cleanup

When modifying code:

- Remove unused imports.
- Remove obsolete variables.
- Remove redundant logic.
- Avoid unnecessary comments.
- Use meaningful names.
- Keep functions focused.
- Avoid deeply nested conditionals.
- Avoid duplicated utilities.
- Prevent circular imports.
- Follow existing lint and formatting conventions.

Remove dead code only after confirming it is not referenced by routes, dynamic imports, configuration, or other consumers.

Do not rewrite unrelated modules during a focused task.

---

## 22. Testing Guidelines

Test behavior relevant to the change.

### General Validation

- TypeScript checking
- Linting
- Existing tests
- Relevant new tests
- Build validation where appropriate

### Authentication

- Protected route access
- Role authorization
- Expired-session behavior
- Unauthorized API operations

### Ride Booking

Where applicable:

- Booking creation
- Cancellation
- Driver assignment
- Duplicate submissions
- Invalid ride transitions
- Concurrent operations
- Stale data
- Payment-related failures

### RTK Query

Where applicable:

- Successful queries
- Failed queries
- Mutation behavior
- Cache invalidation
- Authentication errors
- Loading states
- Refetch behavior

Use the existing testing framework.

Do not add an entirely new testing stack without justification.

Never claim tests passed unless they were executed successfully.

---

## 23. Agent Workflow

Every coding task must follow an appropriate workflow.

### Step 1 — Inspect

- Understand the requested change.
- Read relevant files.
- Find existing implementations.
- Identify affected features.
- Identify reusable components and generated endpoints.

### Step 2 — Plan

For substantial changes:

- Define the smallest implementation.
- Identify affected files.
- Consider API contracts.
- Consider authorization.
- Consider caching.
- Identify regression risks.
- Determine required tests.

Do not produce unnecessary planning documents for trivial changes.

### Step 3 — Implement

- Follow existing architecture.
- Reuse generated API hooks.
- Use generated API types.
- Avoid duplicating endpoints.
- Keep components focused.
- Preserve existing behavior.
- Make changes only where required.

### Step 4 — Verify

- Review the changed files.
- Run applicable checks.
- Verify API usage.
- Verify relevant cache behavior.
- Verify role permissions.
- Check for regressions.
- Confirm generated files were not manually modified.

### Step 5 — Report

Provide a concise summary containing:

- Changes made
- Important files changed
- Why the changes were necessary
- Validation performed
- Remaining issues or limitations

Do not describe unexecuted verification as successful.

---

## 24. Strict Prohibitions

Never:

- Modify generated RTK Query files manually.
- Duplicate generated API types unnecessarily.
- Create redundant handwritten API clients.
- Assume a backend endpoint exists.
- Invent request or response fields.
- Bypass backend authorization.
- Trust frontend roles for protected operations.
- Copy RTK Query server state into unnecessary Redux slices.
- Introduce duplicate business logic.
- Overengineer simple functionality.
- Add unnecessary dependencies.
- Create speculative architecture.
- Perform unrelated large-scale refactoring.
- Suppress TypeScript errors without justification.
- Ignore failed API mutations.
- Introduce excessive API polling.
- Leave subscriptions or listeners uncleaned.
- Perform destructive database operations without authorization.
- Delete code without checking its usage.
- Claim tests passed without running them.

---

## 25. Engineering Decision Priority

When choosing between solutions, prioritize:

1. Correctness and security.
2. Compatibility with the existing codebase.
3. Reuse of generated OpenAPI contracts.
4. Reuse of existing functionality.
5. Simplicity.
6. Maintainability.
7. Performance.
8. Minimal unnecessary changes.

A straightforward implementation is preferable to an elaborate architecture that adds no measurable value.

---

## 26. Final Engineering Rules

Before considering a task complete, verify:

- Existing architecture was respected.
- Generated API contracts were reused.
- No unnecessary API or type duplication was introduced.
- Relevant permissions were respected.
- RTK Query cache behavior remains correct.
- New code is readable and maintainable.
- Existing functionality is preserved.
- Relevant tests and checks were performed or limitations clearly reported.

**Final Principle:**

Understand the existing code before making changes.

Reuse what is already implemented.

Keep OpenAPI as the source of truth for API contracts.

Use RTK Query for server state.

Use Redux slices only for appropriate shared client state.

Keep Admin, Passenger, and Driver workflows modular.

Write clean, production-quality code without unnecessary complexity.