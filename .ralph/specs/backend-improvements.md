# Backend Improvements Specification

## 1. Pagination

### Request Format
All list endpoints accept:
- `page` (int, default: 1, min: 1)
- `limit` (int, default: 20, min: 1, max: 100)

### Response Format
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Endpoints to Update
1. **GET /api/patients** - Add pagination with search still working
2. **GET /api/appointments** - Add pagination with date/status filters still working

### Implementation
```ts
const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
const skip = (page - 1) * limit;

const [data, total] = await Promise.all([
  prisma.patient.findMany({ where, skip, take: limit, orderBy: { name: "asc" } }),
  prisma.patient.count({ where }),
]);

return NextResponse.json({
  data,
  meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
});
```

### Frontend Hook Updates
Update `usePatients` and `useAppointments` hooks to accept page/limit params and return meta.

---

## 2. Dashboard Stats Optimization

**File**: `src/app/api/dashboard/route.ts`

Replace:
```ts
// BAD: Fetches ALL appointments then filters in memory
const appointments = await prisma.appointment.findMany({ where: { userId, dateTime: { gte, lte } } });
const confirmed = appointments.filter(a => a.status === "CONFIRMED").length;
```

With:
```ts
// GOOD: Database-level aggregation
const [total, confirmed, notConfirmed, noShow, canceled] = await Promise.all([
  prisma.appointment.count({ where: { userId, dateTime: { gte: monthStart, lte: monthEnd } } }),
  prisma.appointment.count({ where: { userId, dateTime: { gte: monthStart, lte: monthEnd }, status: "CONFIRMED" } }),
  prisma.appointment.count({ where: { userId, dateTime: { gte: monthStart, lte: monthEnd }, status: "NOT_CONFIRMED" } }),
  prisma.appointment.count({ where: { userId, dateTime: { gte: monthStart, lte: monthEnd }, status: "NO_SHOW" } }),
  prisma.appointment.count({ where: { userId, dateTime: { gte: monthStart, lte: monthEnd }, status: "CANCELED" } }),
]);
```

---

## 3. Appointment Conflict Detection

**Current**: Only checks exact dateTime match (useless).

**Fix**: Check for overlapping time window. Since there's no `duration` field, use a 1-hour default window:

```ts
const oneHourMs = 60 * 60 * 1000;
const appointmentDate = new Date(dateTime);
const windowStart = new Date(appointmentDate.getTime() - oneHourMs);
const windowEnd = new Date(appointmentDate.getTime() + oneHourMs);

const conflicting = await prisma.appointment.findFirst({
  where: {
    userId: session.user.id,
    dateTime: { gte: windowStart, lte: windowEnd },
    status: { notIn: ["CANCELED", "NO_SHOW"] },
    id: { not: appointmentId }, // Exclude self on update
  },
});
```

---

## 4. Past Date Validation

In `POST /api/appointments`:
```ts
if (new Date(dateTime) < new Date()) {
  return badRequestResponse("Não é possível agendar no passado");
}
```

---

## 5. Delete Response Fix

All DELETE endpoints should return:
```ts
return NextResponse.json<ApiResponse>({
  data: null,
  message: "Recurso excluído com sucesso",
});
```

---

## 6. String Length Validation

Update Zod schemas:
```ts
// patient.ts
name: z.string().min(3).max(200),
phone: z.string().regex(/^\+55\d{10,11}$/),
email: z.string().email().max(320).optional(),
notes: z.string().max(2000).optional(),

// appointment.ts
notes: z.string().max(2000).optional(),

// settings.ts
confirmationMessage: z.string().min(10).max(1000),
reminderMessage: z.string().min(10).max(1000),

// auth.ts
name: z.string().min(3).max(200),
clinicName: z.string().min(3).max(200),
```
