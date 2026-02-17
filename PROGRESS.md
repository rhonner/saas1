# PROGRESS.md - ConfirmaAí

Rastreamento de progresso de cada teammate.

---

## team-lead - 2026-02-16

### Feito
- Criado projeto Next.js 14 com TypeScript, Tailwind CSS, ESLint
- Instalado e configurado shadcn/ui (16 componentes: button, card, input, label, dialog, table, select, badge, tabs, separator, dropdown-menu, sheet, avatar, form, textarea, sonner)
- Instalado Prisma, NextAuth, Zod, Zustand, TanStack Query, Recharts, React Hook Form, node-cron, date-fns, lucide-react
- Instalado devDependencies: vitest, testing-library, playwright, ts-node
- Criado estrutura de diretórios completa (app routes, api routes, lib, hooks, stores)
- Criado .env.example com todas as variáveis documentadas
- Criado CLAUDE.md, PROGRESS.md, ARCHITECTURE.md

### Próximo
- Delegar tarefas aos teammates
- backend-api começa pelo schema Prisma + seed
- Depois: frontend-dashboard e scheduler-whatsapp em paralelo
- qa-tester quando houver código para testar

---

## backend-api - 2026-02-16

### Feito - Task #1: Prisma Schema
- Created complete Prisma schema with all models: User, Patient, Appointment, MessageLog, Settings
- Added enums: AppointmentStatus (PENDING, CONFIRMED, NOT_CONFIRMED, CANCELED, NO_SHOW), MessageType (CONFIRMATION, REMINDER), MessageStatus (SENT, DELIVERED, READ, FAILED)
- Added proper indexes for performance: userId, patientId, dateTime, status, appointmentId
- Installed bcryptjs for password hashing
- Created comprehensive seed file (prisma/seed.ts) with:
  - 1 test user (admin@teste.com / 123456) with hashed password
  - 5 patients with realistic BR names and phone numbers
  - Default settings for user (24h confirmation, 6h reminder)
  - 10 appointments spread over 7 days with mixed statuses
  - Message logs for appointments with confirmation/reminder tracking
- Generated Prisma client to /Users/rennohr/development/not-work/saas1/src/generated/prisma

### Feito - Task #2: API Routes
- Installed NextAuth v5 beta for Next.js App Router
- Created complete authentication system:
  - NextAuth configuration with JWT strategy (/Users/rennohr/development/not-work/saas1/src/lib/auth.ts)
  - CredentialsProvider with bcrypt password validation
  - Session with user id, email, name, clinicName
  - NextAuth route handler (/Users/rennohr/development/not-work/saas1/src/app/api/auth/[...nextauth]/route.ts)
  - Registration endpoint (/Users/rennohr/development/not-work/saas1/src/app/api/auth/register/route.ts)
  - TypeScript type extensions (/Users/rennohr/development/not-work/saas1/src/types/next-auth.d.ts)
- Created Zod validation schemas:
  - /Users/rennohr/development/not-work/saas1/src/lib/validations/auth.ts (login, register)
  - /Users/rennohr/development/not-work/saas1/src/lib/validations/patient.ts (create, update)
  - /Users/rennohr/development/not-work/saas1/src/lib/validations/appointment.ts (create, update)
  - /Users/rennohr/development/not-work/saas1/src/lib/validations/settings.ts (update)
- Created API response types (/Users/rennohr/development/not-work/saas1/src/lib/types/api.ts)
- Created auth helper functions (/Users/rennohr/development/not-work/saas1/src/lib/auth-helpers.ts)
- Implemented Patients CRUD:
  - GET /api/patients - List with search filter
  - POST /api/patients - Create patient
  - GET /api/patients/[id] - Get single patient
  - PUT /api/patients/[id] - Update patient
  - DELETE /api/patients/[id] - Delete (validates no future appointments)
- Implemented Appointments CRUD:
  - GET /api/appointments - List with filters (date, status, patientId, dateRange)
  - POST /api/appointments - Create with conflict detection
  - GET /api/appointments/[id] - Get single appointment
  - PUT /api/appointments/[id] - Update with conflict detection
  - DELETE /api/appointments/[id] - Delete appointment
- Implemented Dashboard endpoint:
  - GET /api/dashboard - Returns monthly stats (total, confirmed, notConfirmed, noShow, canceled, rates, estimatedLoss, weeklyData)
- Implemented Settings endpoints:
  - GET /api/settings - Get settings (creates default if missing)
  - PUT /api/settings - Update settings

### Key Files Created
**Validation Schemas:**
- /Users/rennohr/development/not-work/saas1/src/lib/validations/auth.ts
- /Users/rennohr/development/not-work/saas1/src/lib/validations/patient.ts
- /Users/rennohr/development/not-work/saas1/src/lib/validations/appointment.ts
- /Users/rennohr/development/not-work/saas1/src/lib/validations/settings.ts

**Types & Helpers:**
- /Users/rennohr/development/not-work/saas1/src/lib/types/api.ts
- /Users/rennohr/development/not-work/saas1/src/lib/auth.ts
- /Users/rennohr/development/not-work/saas1/src/lib/auth-helpers.ts
- /Users/rennohr/development/not-work/saas1/src/types/next-auth.d.ts

**API Routes:**
- /Users/rennohr/development/not-work/saas1/src/app/api/auth/[...nextauth]/route.ts
- /Users/rennohr/development/not-work/saas1/src/app/api/auth/register/route.ts
- /Users/rennohr/development/not-work/saas1/src/app/api/patients/route.ts
- /Users/rennohr/development/not-work/saas1/src/app/api/patients/[id]/route.ts
- /Users/rennohr/development/not-work/saas1/src/app/api/appointments/route.ts
- /Users/rennohr/development/not-work/saas1/src/app/api/appointments/[id]/route.ts
- /Users/rennohr/development/not-work/saas1/src/app/api/dashboard/route.ts
- /Users/rennohr/development/not-work/saas1/src/app/api/settings/route.ts

### Technical Implementation
- All routes use NextAuth getServerSession for authentication
- Zod validation on all inputs with proper error messages
- Proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Consistent error handling with ApiResponse type
- Multi-tenancy: All queries filtered by session.user.id
- Patient ownership verification before updates/deletes
- Appointment conflict detection on create/update
- Dashboard calculates weekly stats with date-fns
- Case-insensitive search on patient name/email/phone

### Próximo
- Test all API endpoints
- Add rate limiting middleware
- Add request logging
- Consider pagination for large datasets
- Add API documentation

---

## scheduler-whatsapp - 2026-02-16

### Feito
- Created complete scheduler and WhatsApp integration system
- Implemented WhatsApp service (/Users/rennohr/development/not-work/saas1/src/lib/services/whatsapp.ts):
  - sendWhatsAppMessage function with Evolution API integration
  - Proper error handling and logging
  - Environment variable validation
- Implemented message template service (/Users/rennohr/development/not-work/saas1/src/lib/services/message-template.ts):
  - formatMessage function with template variable replacement
  - formatAppointmentDate with pt-BR locale (e.g., "segunda-feira, 17 de fevereiro")
  - formatAppointmentTime for HH:mm format
- Implemented webhook parser (/Users/rennohr/development/not-work/saas1/src/lib/services/webhook-parser.ts):
  - parseResponse function with pattern matching for confirmation/cancellation
  - Support for multiple response formats (numbers, words in PT/EN)
- Implemented core scheduler (/Users/rennohr/development/not-work/saas1/src/lib/services/scheduler.ts):
  - sendConfirmations: Sends confirmations X hours before appointment
  - sendReminders: Sends reminders to unconfirmed appointments
  - markNoShows: Automatically marks past pending appointments as NO_SHOW
  - Proper Prisma queries with user settings and patient includes
- Implemented scheduler initialization (/Users/rennohr/development/not-work/saas1/src/lib/services/scheduler-init.ts):
  - Cron job running every 30 minutes
  - Startup and execution logging
- Created Next.js instrumentation hook (/Users/rennohr/development/not-work/saas1/instrumentation.ts):
  - Starts scheduler only on Node.js runtime (not Edge)
- Implemented WhatsApp webhook handler (/Users/rennohr/development/not-work/saas1/src/app/api/webhook/whatsapp/route.ts):
  - POST endpoint for Evolution API webhooks
  - Phone number parsing from remoteJid
  - Message text extraction from conversation or extendedTextMessage
  - Automatic appointment status updates (CONFIRMED/CANCELED)
  - MessageLog updates with response tracking
  - Graceful error handling (always returns 200 for webhook stability)
- Updated next.config.ts with instrumentationHook: true

### Key Files Created
- /Users/rennohr/development/not-work/saas1/src/lib/services/whatsapp.ts
- /Users/rennohr/development/not-work/saas1/src/lib/services/message-template.ts
- /Users/rennohr/development/not-work/saas1/src/lib/services/webhook-parser.ts
- /Users/rennohr/development/not-work/saas1/src/lib/services/scheduler.ts
- /Users/rennohr/development/not-work/saas1/src/lib/services/scheduler-init.ts
- /Users/rennohr/development/not-work/saas1/instrumentation.ts
- /Users/rennohr/development/not-work/saas1/src/app/api/webhook/whatsapp/route.ts

### Key Files Modified
- /Users/rennohr/development/not-work/saas1/next.config.ts - Added instrumentationHook

### Environment Variables Required
```
EVOLUTION_API_URL=https://your-evolution-api.com
EVOLUTION_API_KEY=your-api-key
EVOLUTION_INSTANCE_NAME=your-instance-name
```

### Technical Details
- All code in TypeScript with proper typing
- Uses Prisma singleton from src/lib/prisma.ts
- Date operations with date-fns and pt-BR locale
- Scheduler runs every 30 minutes checking for confirmations, reminders, and no-shows
- Webhook handles multiple message formats and updates appointment status atomically
- All database queries properly filtered by relationships (patient → appointments)

### Próximo
- Test scheduler with real Evolution API instance
- Monitor scheduler logs in production
- Add retry logic for failed WhatsApp messages
- Consider adding delivery status webhooks from Evolution API
