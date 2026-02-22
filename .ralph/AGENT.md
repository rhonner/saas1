# Agent Build Instructions

## Project Setup
```bash
cd /Users/rennohr/development/not-work/saas1
npm install
npx prisma generate
```

## Database
```bash
# Start PostgreSQL (Docker)
docker run --name confirmaai-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=confirmaai -p 5432:5432 -d postgres:16

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# DB GUI
npx prisma studio
```

## Running Tests
```bash
# Unit tests (fast - run after every change)
npx vitest run

# Specific test file
npx vitest run tests/unit/webhook-parser.test.ts

# E2E tests (requires dev server running)
npm run dev &
npx playwright test

# Specific E2E test
npx playwright test tests/e2e/dashboard.spec.ts
```

## Build Commands
```bash
# Production build (check for TypeScript errors)
npm run build

# Type check only
npx tsc --noEmit

# Lint
npm run lint
```

## Development Server
```bash
npm run dev
# Runs on http://localhost:3000
# API available at http://localhost:3000/api/
```

## Key Project Facts
- Next.js 16 App Router monolith (frontend + API in same project)
- Prisma v7 requires @prisma/adapter-pg adapter
- NextAuth v4 with JWT strategy
- Zod v4 uses .issues not .errors
- API response wrapper: { data: T }
- Seed user: admin@teste.com / 123456
- Multi-tenant by userId on all queries
- params in route handlers is a Promise (Next.js 16)

## Key Learnings
- Update this section when you learn new build optimizations
- Document any gotchas or special setup requirements

## Feature Completion Checklist
Before marking ANY task as complete, verify:
- [ ] `npx vitest run` passes
- [ ] `npx tsc --noEmit` passes (no type errors)
- [ ] Changes committed with conventional commit messages
- [ ] .ralph/fix_plan.md task marked as complete [x]
