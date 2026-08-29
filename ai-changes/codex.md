# Zan — Complete Project Context

## 1. Project Overview

Zan is a decentralized GPU compute marketplace.

The platform connects two primary user groups:

1. Clients who need GPU compute resources.
2. Providers who have GPU compute resources and want to monetize them.

The product enables clients to submit compute jobs and providers to execute those jobs using their local GPU infrastructure.

Zan is intended to provide an end-to-end compute marketplace including:

- job creation
- GPU requirement specification
- provider matching
- job execution
- progress tracking
- result delivery
- wallet identity
- blockchain-aware settlement and escrow

The product should feel like a modern, polished GPU compute platform and workspace.

---

# 2. Core Product Vision

Clients should be able to:

- authenticate
- create GPU compute jobs
- specify workload requirements
- specify framework/runtime information
- specify GPU requirements
- specify VRAM requirements
- specify budget
- specify runtime constraints
- submit jobs
- track job progress
- inspect job details
- access completed outputs

Providers should be able to:

- authenticate
- connect identity and wallet
- run the Zan provider desktop application
- connect their local compute resources
- receive available jobs
- accept or reject jobs
- execute workloads
- report execution status
- upload outputs
- receive compensation after successful execution

The platform coordinates:

- authentication
- user roles
- job lifecycle
- provider execution
- wallet identity
- settlement/escrow
- result delivery

---

# 3. Technical Architecture

The repository is a monorepo.

Major technologies include:

## Web Application

- Next.js 16.2.0
- TypeScript
- NextAuth 4.24.14

Responsibilities include:

- authentication
- registration
- login
- dashboards
- job submission
- job tracking
- provider/client UI
- wallet flows
- user sessions

---

## API Layer

An Express-based API server.

Responsibilities include:

- API authentication
- user operations
- wallet operations
- job lifecycle
- provider coordination
- execution metadata
- business logic

Express APIs use JWT-based authentication independently from Next.js route protection.

---

## Database

- Prisma
- Postgres-compatible database

Core entities include concepts such as:

- User
- Role
- Wallet
- Job
- Provider information
- Execution metadata
- Output artifacts

Before changing the schema, inspect existing models and relationships.

Do not create duplicate entities or parallel data models.

---

## Provider Application

- Electron desktop application

Responsibilities include:

- provider-side interaction
- local compute coordination
- backend communication
- execution semantics
- job execution
- reporting status
- uploading results

---

## Blockchain / On-Chain Layer

The repository includes blockchain/Solana/contract-related code.

This layer may support:

- settlement
- escrow
- wallet identity
- value transfer
- execution verification

Do not assume blockchain functionality is complete merely because contract code exists.

Trace integrations end-to-end before claiming functionality is implemented.

---

# 4. Core User Roles

## Client

Primary goal:

"I need compute resources. I want to submit and track my workloads."

Client-oriented functionality includes:

- dashboard
- create job
- jobs
- job details
- job outputs
- wallet

---

## Provider

Primary goal:

"I want to provide compute capacity, execute work, and earn from it."

Provider-oriented functionality includes:

- provider dashboard
- compute status
- available jobs
- active jobs
- execution tracking
- earnings
- wallet

Client and Provider experiences should not necessarily share identical navigation.

---

# 5. Authentication Architecture

Authentication uses:

- NextAuth 4.24.14
- encrypted JWT sessions
- credentials-based authentication
- NEXTAUTH_SECRET
- NEXTAUTH_URL

The JWT/session contains information such as:

- user ID
- role
- Express API access token

Important:

Next.js authentication and Express API authentication are separate layers.

The proxy determines whether a web user is authenticated.

Express APIs independently validate access tokens.

Do not remove API authorization because route protection exists.

---

# 6. Route Protection Architecture

The application uses Next.js 16.2.0.

Route protection is implemented using root-level:

proxy.ts

Next.js recognizes it as:

Proxy (Middleware)

The proxy is the authoritative layer for page-level authentication redirects.

Do not create duplicate authentication redirect systems unless absolutely necessary.

---

# 7. Route Categories

There are three categories.

## PUBLIC

Accessible whether authenticated or not.

Examples include:

/

Public routes must remain accessible to everyone.

---

## AUTH_ONLY

Accessible only to unauthenticated users.

Current examples:

/login
/register

Behavior:

Unauthenticated user:

Allow access.

Authenticated user:

Redirect to role-specific dashboard.

Default destinations:

CLIENT -> /client

PROVIDER -> /provider

Unknown roles:

Use the existing safe fallback, currently /client unless the existing project defines a better authenticated fallback.

---

## PROTECTED

Current protected route patterns include:

/client/:path\*

/provider/:path\*

/stake

/wallet

Behavior:

Authenticated:

Allow.

Unauthenticated:

Redirect to:

/login?callbackUrl=<original internal path and query></original>

The callback URL must preserve:

- pathname
- query parameters

Example:

/client/jobs/123?tab=details

should return to that same internal destination after successful login.

---

# 8. Callback URL Security Rules

Callback URLs must be validated.

Only internal application paths are allowed.

Accept paths beginning with a single:

/

Reject:

- absolute URLs
- https://example.com
- http://example.com
- protocol-relative URLs such as //example.com
- malformed URLs
- external origins
- encoded attempts to bypass validation
- auth-only destinations such as /login
- /register

Never introduce an open redirect vulnerability.

If callbackUrl is invalid or missing:

Redirect to the role-specific default dashboard.

---

# 9. Wallet Special Flow

The application intentionally supports:

/wallet?token=...

This is a special external/API token verification flow.

Important:

The presence of the token allows the request to reach the wallet verification interface.

The token must still be validated by the existing backend/API flow before any wallet mutation or privileged action occurs.

Do not trust a token merely because it exists in the URL.

The current implementation preserves this flow.

Known UX/security concern:

Tokens in URLs may appear in:

- browser history
- logs
- referrer information

Possible future improvement:

1. Capture the token.
2. Validate or exchange it.
3. Remove it from the visible URL.
4. Consider Referrer-Policy: no-referrer for this flow.

Do not mix this change into unrelated route-protection work.

---

# 10. Previous Route Protection Problems

Before the proxy implementation:

- protected routes relied on client-side guards
- authenticated users could access some auth pages
- /register lacked authenticated-user redirect
- /stake was publicly accessible
- login ignored callbackUrl
- protected page shells could potentially flash before client hydration
- route protection was inconsistent

These issues have been addressed through proxy-based protection.

---

# 11. Current Route Protection Status

The authentication and route protection review found:

No CRITICAL issues.

No HIGH issues.

Verified:

- no redirect loops
- / is accessible
- /login works correctly for logged-out users
- /register works correctly for logged-out users
- authenticated users are redirected away from login
- authenticated users are redirected away from registration
- nested callback paths preserve pathname and query
- malicious callback URLs are rejected
- protected pages do not flash before redirect on direct visits
- API authentication remains independent
- ownership checks remain intact
- provider/client workspace switching remains compatible

---

# 12. Important Duplicate Client Guard Issue

Some protected pages previously used:

useSession({ required: true })

This duplicates the responsibility now handled by proxy.ts.

It can also generate absolute callback URLs during session expiry.

Those absolute URLs are correctly rejected by the secure login callback validator.

This can cause users to lose their original destination and fall back to the role dashboard.

Affected areas previously identified include:

- client dashboard page
- provider dashboard page
- client job submission page
- client job details page

Preferred architecture:

proxy.ts owns authentication redirects.

Pages may still use:

useSession()

when session data is needed for:

- API readiness
- displaying user information
- rendering state
- business logic

Do not use required:true merely to protect a route that is already protected by proxy.ts.

Do not remove:

- ownership checks
- not-found logic
- role/business authorization
- API authentication
- page-specific validation

---

# 13. Authentication vs Authorization

These concepts must remain separate.

## Authentication

Who is the user?

Handled by:

- NextAuth
- JWT/session
- proxy.ts for page access

---

## Route Protection

Can an authenticated or unauthenticated user enter this part of the web application?

Handled primarily by:

proxy.ts

---

## Authorization

Can this user perform this specific action?

Examples:

- Can this user view this job?
- Does this job belong to the user?
- Is this provider authorized to execute this job?
- Can this user mutate this wallet?

Authorization must remain server-side.

Do not rely on frontend route protection for authorization.

---

# 14. Known Architecture Issue: Token Lifetime Divergence

The application embeds an Express API access token inside the NextAuth session/JWT.

Potential issue:

NextAuth session:

VALID

while:

Express API access token:

EXPIRED

Result:

proxy.ts -> user is authenticated

page -> renders

Express API -> 401 Unauthorized

This issue was not introduced by proxy.ts.

It is an existing architecture concern.

Do not solve this by adding database calls inside proxy.ts.

Before implementing any fix:

Audit:

- NextAuth maxAge
- NextAuth updateAge
- JWT callback behavior
- Express access token lifetime
- token issuance
- refresh token availability
- token rotation
- API 401 handling
- interceptors/retry patterns

Create a token lifecycle diagram.

Only then choose an approach.

Potential solutions may include coordinated expiry or token refresh.

Do not introduce a parallel authentication system.

---

# 15. Existing Product Audit Principles

Never assume a feature is implemented merely because UI exists.

A feature should be audited across the full chain:

UI
→ validation
→ API
→ business logic
→ database
→ provider integration
→ blockchain integration

where applicable.

Classify product requirements as:

- IMPLEMENTED
- PARTIALLY IMPLEMENTED
- NOT IMPLEMENTED
- IMPLEMENTED BUT BROKEN
- UNCLEAR / NEEDS VERIFICATION

Provide evidence:

- file paths
- components
- API routes
- services
- Prisma models
- Electron modules
- blockchain integration
- tests

---

# 16. Current UX Problems

The current application UX requires a dedicated audit.

Known concerns include:

- crowded navbar
- too many navigation items in the top navigation
- public website navigation and dashboard navigation may be mixed together
- no obvious sign-out action inside the authenticated dashboard
- client and provider experiences may be insufficiently differentiated
- unclear information hierarchy
- potentially duplicated navigation
- missing account/user menu
- navigation may not scale well as features increase
- possible weak mobile navigation
- missing or inconsistent active states
- important actions may be difficult to discover

Do not immediately redesign without auditing the current structure.

---

# 17. UX Architecture Goal

The application should have separate navigation systems.

## Public Website Navigation

Keep lightweight.

Conceptually:

Zan Logo

Product

How It Works

Providers

Documentation

Sign In

Get Started

Do not put every application feature in the public navbar.

---

# 18. Authenticated Application Navigation

Authenticated users should experience Zan as a product workspace.

Prefer an application shell with:

- sidebar or structured workspace navigation
- contextual top bar
- user/account menu

Conceptually:

Zan

Overview

Jobs

Create Job

Wallet

Stake

---

Settings

Profile

Account menu

Sign out

The exact implementation must be based on the existing design system and codebase.

Do not blindly introduce a sidebar if the current architecture makes another solution more appropriate.

However, avoid keeping all dashboard functionality inside a crowded top navbar.

---

# 19. Account Menu

Authenticated users need a clear account menu.

Potential contents:

Profile

Account Settings

Wallet

Role/Workspace context where appropriate

Separator

Sign Out

Sign out must be:

- visible
- accessible
- intentional
- integrated with existing NextAuth logout behavior

Do not implement a custom logout system if NextAuth already provides the correct flow.

---

# 20. Client Navigation Goal

Client users primarily care about:

Overview

My Jobs

Create Job

Wallet

Potential contextual actions:

Create Job should be prominent.

The UX should answer:

"What compute work do I have?"

"What is currently running?"

"How do I create a new job?"

"Where are my completed results?"

---

# 21. Provider Navigation Goal

Provider users primarily care about:

Overview

Compute / Machine Status

Available Jobs

Active Jobs

Earnings

Wallet

The UX should answer:

"Is my compute machine available?"

"Are there jobs I can accept?"

"What am I currently executing?"

"What have I earned?"

Client and Provider navigation should not be identical if their workflows differ.

---

# 22. UX Audit Requirements

Before changing UI:

Analyze:

1. Public navigation
2. Authentication pages
3. Dashboard navigation
4. Client workspace
5. Provider workspace
6. Wallet flow
7. Job creation
8. Job management
9. Account management
10. Sign-out accessibility
11. Mobile navigation
12. Responsive behavior

For every major page/navigation component identify:

- purpose
- target user
- primary action
- secondary actions
- navigation dependencies
- duplicated navigation
- unnecessary navigation items
- missing actions
- confusing terminology
- UX friction

Create a navigation map.

Evaluate separately for:

- unauthenticated users
- clients
- providers

---

# 23. UI Implementation Principles

When modifying UI:

1. Analyze existing components first.
2. Reuse existing UI components.
3. Reuse existing design tokens.
4. Reuse existing styling conventions.
5. Do not add dependencies unnecessarily.
6. Preserve responsive behavior.
7. Do not introduce duplicate component systems.
8. Avoid premature abstraction.
9. Prefer focused components.
10. Keep business logic separate from presentation.
11. Include:

- loading states
- error states
- empty states
- responsive states
- accessibility considerations

Do not rebuild unrelated pages during a focused UX improvement.

---

# 24. Recommended UX Implementation Sequence

Phase 1:

Audit current navigation and information architecture.

No code changes.

---

Phase 2:

Simplify public navbar.

Separate marketing/public navigation from application navigation.

---

Phase 3:

Implement or improve authenticated application shell.

This may include:

- structured sidebar
- responsive navigation
- top bar
- active navigation states

---

Phase 4:

Implement account/user menu.

Include:

- profile
- account settings where available
- wallet access where appropriate
- sign out

---

Phase 5:

Optimize Client workspace.

Focus on:

- overview
- jobs
- create job
- results

---

Phase 6:

Optimize Provider workspace.

Focus on:

- machine status
- available jobs
- active jobs
- earnings

---

Phase 7:

Review mobile and responsive navigation.

---

# 25. Development Workflow

Never implement the entire product at once.

Use this sequence:

Audit
→ Implementation Matrix
→ Prioritized Plan
→ Implement One Logical Feature Group
→ Test
→ Verify
→ Fix Confirmed Problems
→ Continue

Do not make large architectural changes without first understanding the existing repository.

---

# 26. Code Quality Rules

Before implementing:

- inspect existing code
- find reusable utilities
- find existing components
- find existing types
- find existing API patterns
- find existing validation patterns

Do not:

- create duplicate APIs
- create duplicate state systems
- introduce unnecessary dependencies
- rewrite working systems
- rename unrelated files
- create parallel architecture

Use strict TypeScript.

Avoid any unless unavoidable.

Remove:

- dead code
- unused imports
- duplicate logic

---

# 27. State Management

Reuse the existing state management architecture.

Do not introduce new global state without a genuine cross-application need.

Keep local UI state close to the components that use it.

Do not create global state simply for route protection.

---

# 28. API Rules

Before creating an endpoint:

1. Search for an existing equivalent.
2. Inspect route conventions.
3. Inspect authentication.
4. Inspect authorization.
5. Inspect validation.

Every important API operation should consider:

- authentication
- authorization
- validation
- error handling
- typed responses

---

# 29. Database Rules

Before changing Prisma:

- inspect existing schema
- inspect relationships
- inspect migrations
- search for existing equivalent fields/models

Do not add speculative fields.

Every schema change must correspond to a product requirement.

---

# 30. Security Rules

Treat these areas as security-sensitive:

- authentication
- JWT/session handling
- callback URLs
- wallet verification
- wallet signatures
- nonce generation
- provider identity
- job ownership
- settlement
- escrow
- blockchain transactions

Never weaken security for convenience.

Do not trust:

- client-provided role
- client-provided user identity
- client-provided ownership
- wallet address without verification
- callback URLs without validation

---

# 31. Before Completing Any Task

Always:

1. Review changed files.
2. Review the diff.
3. Check TypeScript.
4. Check lint.
5. Run relevant tests.
6. Check for unused imports.
7. Check for dead code.
8. Verify loading states.
9. Verify error states.
10. Verify responsive behavior.
11. Verify authentication.
12. Verify authorization.

Do not claim functionality works unless it has been verified.

---

# 32. How the AI Agent Should Work

For every requested change:

FIRST:

Analyze the existing implementation.

THEN:

Identify:

- files involved
- reusable code
- risks
- dependencies

THEN:

Provide a concise implementation plan.

Only then implement.

Do not start rewriting large portions of the repository without understanding the existing architecture.

---

# 33. Immediate Current Goal

The immediate focus is UX and UI quality.

Perform a complete UX and information architecture audit before modifying the UI.

The authentication and proxy architecture should remain unchanged during this UX audit.

Primary questions:

1. Why is the navbar crowded?
2. Which links belong to the public website?
3. Which links belong inside the authenticated application?
4. Should dashboard navigation move into an application shell/sidebar?
5. Where should sign out live?
6. What navigation should Client users see?
7. What navigation should Provider users see?
8. Which navigation items are duplicated or unnecessary?
9. What is missing from account management?
10. How does the navigation behave on mobile?

After the audit:

Create:

- current navigation map
- UX problem list
- severity
- recommended information architecture
- desktop navigation proposal
- mobile navigation proposal
- implementation roadmap

Do not modify code until the proposed UX architecture is approved.
