# Zan — Implemented Product Idea

## 1. Product Vision

Zan is a decentralized GPU compute marketplace that connects clients who need GPU resources with providers who can supply compute power through a desktop agent and a web-based coordination layer.

The core idea is simple:

- Clients submit GPU jobs and specify requirements like framework, budget, VRAM, GPU tier, and runtime constraints.
- Providers run a local desktop application that can accept jobs, execute workloads, and report results.
- Escrow and matching are handled with blockchain-backed coordination so trust and accountability are built into the system.
- The platform provides a web portal for job creation, dashboards, wallet linking, authentication, and provider management.

Zan is effectively an on-demand market for compute, designed to make GPU access easier, more transparent, and more trustable than ad-hoc peer-to-peer or centralized renting workflows.

---

## 2. The Problem It Solves

Modern GPU workloads are expensive and often hard to access reliably.

Typical pain points include:

- GPU users struggle to find reliable compute providers quickly.
- Providers want a predictable way to monetize idle compute capacity.
- Job execution requires trust, payment security, and clear validation of deliverables.
- A poor onboarding flow makes the whole network hard to adopt.

Zan addresses these problems by combining:

- an app marketplace interface,
- secure user authentication,
- blockchain-backed escrow logic,
- a provider desktop app,
- job orchestration and result tracking.

---

## 3. Core User Roles

### Client

A client is a user who wants to run AI, ML, rendering, or compute workloads.

They can:

- create a GPU job request,
- specify workload parameters and constraints,
- set budget and runtime expectations,
- track job execution progress,
- download outputs once complete.

### Provider

A provider is a user or operator who contributes GPU resources to the network.

They can:

- run the Zan desktop agent,
- accept or reject incoming job opportunities,
- connect their wallet and identity,
- execute work on their local compute capacity,
- receive compensation when jobs complete successfully.

### Platform Layer

The platform layer coordinates the marketplace and keeps user interfaces, server endpoints, pricing assumptions, wallet flow, and job operations in sync.

---

## 4. High-Level Product Flow

### Job Creation

A client logs in to the web app and submits a job through the dashboard.

The submission includes:

- job description and framework information,
- input URI or source asset,
- required compute resources,
- maximum budget,
- expected runtime constraints,
- optional client wallet address.

### Matching and Escrow

The platform evaluates the job and identifies matching providers or job execution conditions.

It uses routed logic and smart contract-style escrow patterns to ensure funds or commitments are locked before execution begins.

### Provider Execution

A provider uses the desktop app to connect to the network, review available jobs, and accept work.

The provider agent can:

- sync with the backend,
- report execution status,
- upload results or output artifacts,
- signal completion or failure conditions.

### Result Delivery

Once the work is done, outputs are made available to the client through the platform.

The solution supports a workflow where the provider is rewarded for successful execution and the client receives the final output or artifacts.

---

## 5. Technical Architecture

The repository is organized as a monorepo with clear separation between user-facing interfaces and infrastructure.

### Web App

The web application is built with Next.js and is responsible for:

- login and registration,
- wallet auth flow,
- job submission UI,
- provider/client dashboard views,
- user profile and session handling,
- real-time or near-real-time frontend coordination with the API.

### Desktop Provider Agent

The desktop app is built with Electron and allows providers to run a local client directly on their system.

It is designed to:

- remain lightweight and local to the provider’s machine,
- handle provider-side execution semantics,
- connect to the central backend,
- coordinate with user actions and downloads.

### API Server

The server is an Express-based backend that exposes the app’s core APIs.

It is responsible for:

- auth and session management,
- user and wallet APIs,
- job lifecycle operations,
- integration with the database,
- orchestration with decentralized compute flows.

### Database

The project uses Prisma with a Postgres-compatible data layer.

This includes models for:

- users,
- roles,
- wallet state,
- jobs,
- provider/client relationship records,
- execution metadata.

### Smart Contracts / On-Chain Layer

The Solidity/Anchor-style contract package indicates that blockchain-based settlement or escrow logic is integrated into the platform design.

This is a major differentiator of the product: the application is not just a hosted dashboard; it includes blockchain-aware trust and coordination logic for value movement and verification.

---

## 6. Authentication and Identity Model

Authentication is built around a credentials + session model using NextAuth, with JWT-based session persistence.

The flow includes:

- sign-up and login,
- access tokens for API calls,
- role-based session metadata,
- wallet verification for linked addresses,
- protected routes for authenticated users.

Wallet linkage is important because it enables ownership and payment proof tied to a user identity, not just a username or email.

---

## 7. Wallet and Security Model

Zan combines app authentication with wallet-based authorization.

This lets users:

- sign in with email/password,
- verify wallet ownership,
- link a wallet to an account,
- protect actions that require a trusted identity,
- validate provider/client ownership for job execution and settlement work.

The wallet challenge flow includes nonce generation, signed messages, and verification, which is a standard and secure pattern for linking accounts to wallet addresses.

---

## 8. Core Data Model

The system revolves around several essential entities:

- User
- Role
- Job
- Wallet linkage state
- Provider execution information
- Output artifact metadata

The app’s data layer is designed so that execution state can be traced from job creation through completion and result delivery.

---

## 9. Why This Idea Matters

The implemented idea is more than just a scheduler or dashboard.

It is a full-stack marketplace for GPU resources where:

- supply and demand are coordinated dynamically,
- trust and ownership are reinforced by wallet identity and escrow patterns,
- execution can be delegated to self-hosted providers,
- results are tracked as a first-class product flow,
- compute becomes a tradeable resource rather than an opaque platform feature.

In short, Zan aims to make GPU compute more accessible, more verifiable, and easier to monetize.

---

## 10. Current Implementation State

The repo contains the foundation of a real product, not just a prototype:

- a web application,
- an authenticated user system,
- provider dashboards,
- job submission and lifecycle logic,
- desktop agent support,
- database layer and schema,
- smart contract / Solana integration code,
- API endpoints and security patterns.

This is a cohesive, full-stack implementation of a decentralized compute marketplace idea.

---

## 11. Summary

Zan is a decentralized GPU marketplace where clients buy compute capacity and providers sell compute power through a secure, wallet-aware, job-based platform.

The implemented idea combines:

- Next.js frontend,
- Express API backend,
- Prisma/Postgres persistence,
- Electron provider app,
- wallet authentication,
- blockchain-ready escrow and token-aware logic,
- end-to-end job lifecycle management.

This makes Zan a strong foundation for a real GPU compute network with both user-facing product flows and technical infrastructure behind it.
