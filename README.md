# dynauth

A modular, framework-agnostic authentication library for modern web applications.
Built as a headless core with pluggable UI renderers and a self-hosted Express backend — no vendor lock-in, no black boxes.

## Packages

| Package | Description |
|---|---|
| `@dynauth/ui` | Headless auth hooks and utilities. Zero JSX, zero styling opinions. |
| `@dynauth/ui-mui` | Material UI renderer for `@dynauth/ui`. |
| `@dynauth/server` | Express authentication middleware. Session-based auth backed by Redis. |
| `@dynauth/core` | Meta-package. Re-exports all three packages for convenience. |

## Architecture Decisions

**Why not Clerk, Auth0, or Supertokens?**
Full ownership. No SaaS dependency, no recurring cost, no risk of deprecation. The auth layer is too foundational to rent.

**Why headless UI?**
The headless core (`@dynauth/ui`) contains all form state, validation, and request logic as plain React hooks. Renderers (`@dynauth/ui-mui`, future `@dynauth/ui-chakra`) consume those hooks and handle only visuals. Adding a new renderer never touches the logic layer.

**Why session-based auth over JWT?**
Stateful sessions backed by Redis allow instant logout and immediate session revocation on compromise. JWT tokens cannot be invalidated before expiry. Sessions with Redis are sub-millisecond on lookup — the performance concern is a myth at any scale this library targets.

**Why no Passport.js?**
Passport is a consumer-facing abstraction over OAuth providers. This library is the auth system itself — it will eventually provide that abstraction to its own consumers. OAuth flows are implemented from scratch so there is no external dependency on the auth mechanism.

**Why pnpm + Turborepo?**
pnpm handles workspace dependencies correctly with `workspace:*` protocol. Turborepo adds build caching and parallel task execution across packages — a full rebuild from cache takes under 2 seconds.

## Monorepo Structure

```
dynauth/
├── packages/
│   ├── ui/          # @dynauth/ui — headless hooks
│   ├── ui-mui/      # @dynauth/ui-mui — MUI renderer
│   ├── server/      # @dynauth/server — Express middleware
│   └── core/        # @dynauth/core — meta-package
├── apps/
│   └── dev/         # local development playground
└── docs/            # architecture notes and API references
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- Redis (for local development)

## Getting Started

```bash
# Clone the repo
git clone git@github.com:OmkarS-22/dynauth.git
cd dynauth

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start the dev playground
pnpm dev
```

## Development

All commands are run from the repo root via Turborepo.

```bash
pnpm build        # build all packages in dependency order
pnpm dev          # start all packages in watch mode + dev app
pnpm lint         # lint all packages
pnpm test         # run all tests
```

To work on a specific package:

```bash
cd packages/ui
pnpm dev          # watch mode for this package only
```

## Roadmap

### V1 — Core Authentication
- [x] Monorepo setup
- [ ] Types and contracts
- [ ] Password hashing and session management
- [ ] Express route handlers — register, login, logout, me
- [ ] Headless React hooks — useAuthForm, useSession, useFieldValidation
- [ ] MUI renderer — AuthCard, LoginForm, RegisterForm, ProtectedRoute
- [ ] Dev playground end-to-end verification

### V2 — Planned
- [ ] OAuth providers — Google, GitHub (implemented from scratch)
- [ ] Additional UI renderers — Chakra UI, vanilla HTML
- [ ] CAPTCHA integration
- [ ] Magic link / passwordless flow
- [ ] Session management UI — view and revoke active sessions

## Contributing

This is currently a personal project. Contribution guidelines will be added when the V1 milestone is complete.

## License

MIT