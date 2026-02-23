# Fix Plan - E2E Test Fixes & Bug Resolution

## Priority 1: Patient Creation Bug (Internal Server Error)
- [ ] Fix backend API `src/app/api/patients/route.ts` POST handler: strip empty string email/notes to null before passing to Prisma (empty string `""` fails Zod email validation). Clean the input data: if `email === ""` set it to `undefined`, same for `notes`.
- [ ] Fix backend API `src/app/api/patients/route.ts` POST handler: handle Prisma unique constraint violation on `[userId, phone]` - return proper 400 error with "Telefone já cadastrado" message instead of generic 500.
- [ ] Fix frontend form `src/app/(dashboard)/pacientes/page.tsx`: ensure empty optional fields send `undefined` (not empty string) to the API. In the `onSubmit` handler, strip empty strings: `email: data.email || undefined, notes: data.notes || undefined`.
- [ ] Verify fix: run `npx playwright test tests/e2e/pacientes.spec.ts`

## Priority 2: Fix pacientes.spec.ts - Delete Patient Test
- [ ] Fix test `tests/e2e/pacientes.spec.ts` line ~116 "should delete a patient": replace `page.once('dialog', ...)` with interaction against the Radix UI AlertDialog. After clicking the delete button, wait for the AlertDialog to appear, then click the "Cancelar" button. The AlertDialog has `alertdialog` role with "Excluir paciente" title.
- [ ] Verify: run `npx playwright test tests/e2e/pacientes.spec.ts`

## Priority 3: Fix fluxo-completo.spec.ts - Dashboard "Pendentes" Text
- [ ] Fix test `tests/e2e/fluxo-completo.spec.ts` line ~154: change `text=Pendentes` to `text=Faltas` since the dashboard summary cards now show "Confirmados" and "Faltas" (not "Pendentes").
- [ ] Verify: run `npx playwright test tests/e2e/fluxo-completo.spec.ts`

## Priority 4: Fix full-crud.spec.ts - Appointment Week View
- [ ] Investigate and fix `tests/e2e/full-crud.spec.ts` line ~214 "Verify appointment appears in week view with correct time". The test creates an appointment for today at 20:30. Check if: (a) the appointment was actually created (check previous test step), (b) the agenda page shows the right week, (c) timezone issues cause the appointment to display on a different day. Look at the error-context.md screenshot for clues.
- [ ] Verify: run `npx playwright test tests/e2e/full-crud.spec.ts`

## Priority 5: Full Test Suite Green
- [ ] Run ALL tests: `npx playwright test --reporter=line` and verify 0 failures
- [ ] Run `npm run build` to verify no TypeScript errors
- [ ] If any additional failures found, fix them and re-run

## Discovered
<!-- Ralph will add discovered tasks here -->
