# Security Fixes Specification

## 1. Scheduler Initialization

**File**: `src/instrumentation.ts`

The scheduler is defined in `src/lib/services/scheduler-init.ts` but never imported.
The `instrumentation.ts` file exists and checks `NEXT_RUNTIME === "nodejs"` but does NOT call `startScheduler()`.

**Fix**: Import and call `startScheduler()` inside the `register()` function:

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startScheduler } = await import("@/lib/services/scheduler-init");
    startScheduler();
  }
}
```

**Verification**: After fix, check server logs on `npm run dev` for "Scheduler started" message.

---

## 2. Webhook Tenant Isolation

**File**: `src/app/api/webhook/whatsapp/route.ts`

**Current Bug (lines ~30-36)**:
```ts
const patient = await prisma.patient.findFirst({
  where: { phone },  // ❌ NO userId filter!
});
```

This finds ANY patient with that phone number across ALL users.

**Fix**: The webhook receives a phone number but no userId. Strategy:
1. Find the patient with matching phone
2. Find their PENDING appointment closest to now
3. Ensure the appointment, patient, and user all belong together

```ts
// Find the most recent pending appointment for this phone
const appointment = await prisma.appointment.findFirst({
  where: {
    patient: { phone },
    status: "PENDING",
    dateTime: { gte: new Date() },
  },
  orderBy: { dateTime: "asc" },
  include: { patient: true },
});
```

This naturally scopes to the correct user because appointments belong to a specific user's patient.

---

## 3. Webhook API Key Verification

**File**: `src/app/api/webhook/whatsapp/route.ts`

Add header verification at the start of the POST handler:

```ts
const apiKey = request.headers.get("apikey") || request.headers.get("x-api-key");
if (!apiKey || apiKey !== process.env.EVOLUTION_API_KEY) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## 4. Patient Phone Unique Constraint

**File**: `prisma/schema.prisma`

Add to Patient model:
```prisma
model Patient {
  // ... existing fields ...
  @@unique([userId, phone])
}
```

Then run: `npx prisma migrate dev --name add-patient-phone-unique-constraint`

**Note**: If duplicate phone numbers already exist for same user, migration will fail.
Check first: query for duplicates and handle them before migration.
