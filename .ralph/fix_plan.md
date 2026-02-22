# Fix Plan - Revisão Geral do ConfirmaAí

## Priority 1: CRITICAL Security & Core Fixes

- [x] Fix scheduler initialization: import and call `startScheduler()` in `instrumentation.ts` so confirmations/reminders/no-shows are actually processed automatically
- [x] Fix WhatsApp webhook tenant isolation: improved query to order by confirmationSentAt desc and verify userId consistency between appointment and patient
- [x] Add webhook signature/API key verification to `src/app/api/webhook/whatsapp/route.ts` - validate the Evolution API key from request headers before processing
- [x] Add unique constraint `@@unique([userId, phone])` on Patient model in `prisma/schema.prisma` to prevent duplicate phone numbers per user, then run migration

## Priority 2: Backend Quality Improvements

- [x] Add pagination to `GET /api/patients` and `GET /api/appointments` - accept `page` and `limit` query params, return `{ data, meta: { total, page, limit, totalPages } }`
- [x] Fix dashboard stats: replace in-memory filtering with efficient Prisma `count()` queries in `src/app/api/dashboard/route.ts` to avoid loading all appointments
- [x] Improve appointment conflict detection: instead of exact second match, check for overlapping time windows (1-hour default window)
- [x] Add past-date validation on appointment creation: reject appointments with dateTime in the past
- [x] Fix delete responses: ensure all DELETE endpoints return `{ data: null, message: "..." }` instead of missing data field
- [x] Add upper bounds to string validations in Zod schemas: name max 200 chars, notes max 2000 chars, email max 320 chars

## Priority 3: Frontend UX Polish - Loading & States

- [x] Replace all spinner loading states with skeleton loading components: create a reusable `<Skeleton>` component and apply to Dashboard cards, Patients table, Agenda calendar, and Settings form
- [x] Replace browser `window.confirm()` with a custom shadcn/ui AlertDialog component for delete confirmations (patients and appointments)
- [x] Add meaningful empty states with icons and CTA buttons: Patients page ("Cadastre seu primeiro paciente"), Agenda page ("Agende sua primeira consulta"), Dashboard ("Sem dados para exibir")
- [x] Add character counter to WhatsApp message template textareas in Settings page, showing current/max characters

## Priority 4: Frontend UX Polish - Interactions & Mobile

- [x] Auto-close mobile sidebar (Sheet) when navigating to a page - add `onClick` handler that calls `setOpen(false)` on nav items in the dashboard layout
- [x] Add appointment status change UI: add a dropdown/select in agenda appointment cards to change status (PENDING → CONFIRMED, CANCELED, NO_SHOW) directly from the calendar view
- [x] Improve patient search: extend search to also match phone numbers, not just name
- [x] Add consistent toast notifications (Sonner) for ALL mutation operations: success toasts on create/update/delete, error toasts on failures

## Priority 5: Visual & Design Polish

- [x] Add dark mode toggle button in the dashboard header or settings page using next-themes library
- [x] Add WhatsApp template preview in Settings: show a formatted preview of how the message will look with sample data ({nome} → "Maria", {data} → "segunda-feira, 24 de fevereiro", etc.)
- [x] Make dashboard trend indicators dynamic: calculate actual week-over-week changes instead of hardcoded "vs semana passada" text
- [x] Add focus ring indicators for keyboard accessibility: ensure all interactive elements (buttons, inputs, links) have visible focus outlines in both light and dark modes

## Discovered
<!-- Ralph will add discovered tasks here -->
