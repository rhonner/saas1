# Frontend UX Polish Specification

## 1. Skeleton Loading Components

Replace all spinner-based loading with skeleton screens.

### Skeleton Base Component
Use shadcn/ui skeleton or create a minimal one:
```tsx
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}
```

### Where to Apply:
- **Dashboard**: 4 metric card skeletons (height matching card size), chart skeleton
- **Patients Table**: Table rows with skeleton cells
- **Agenda**: Day cards with skeleton appointment blocks
- **Settings**: Form field skeletons

---

## 2. Custom Delete Confirmation Dialog

Replace `window.confirm()` with shadcn/ui AlertDialog:

```tsx
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
      <AlertDialogDescription>
        Tem certeza que deseja excluir? Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Apply to:
- Patient delete button in pacientes page
- Appointment delete button in agenda page

---

## 3. Empty States

### Pattern
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <IconComponent className="h-12 w-12 text-muted-foreground/50 mb-4" />
  <h3 className="text-lg font-medium text-muted-foreground">Title</h3>
  <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">Description</p>
  <Button className="mt-4" onClick={handleAction}>CTA Button</Button>
</div>
```

### Pages:
- **Pacientes** (no patients): Icon: Users, Title: "Nenhum paciente cadastrado", CTA: "Cadastrar paciente"
- **Pacientes** (no search results): Icon: Search, Title: "Nenhum paciente encontrado", Description: "Tente buscar com outro termo"
- **Agenda** (no appointments for week): Icon: Calendar, Title: "Nenhum agendamento nesta semana", CTA: "Agendar consulta"
- **Dashboard** (no data): Icon: BarChart3, Title: "Sem dados para exibir", Description: "Cadastre pacientes e agendamentos para ver suas métricas"

---

## 4. Character Counter for Templates

In Settings page, add character counter below each textarea:
```tsx
<div className="flex justify-between text-xs text-muted-foreground mt-1">
  <span>Variáveis: {"{nome}"}, {"{data}"}, {"{hora}"}, {"{clinica}"}</span>
  <span className={cn(value.length > 900 && "text-destructive")}>
    {value.length}/1000
  </span>
</div>
```

---

## 5. Mobile Sidebar Auto-Close

In Dashboard layout, add navigation handler:
```tsx
const pathname = usePathname();
const { setOpen } = useSidebarStore();

// Close mobile sidebar on navigation
useEffect(() => {
  setOpen(false);
}, [pathname, setOpen]);
```

---

## 6. Appointment Status Change UI

In Agenda page, add a Select dropdown on each appointment card:
```tsx
<Select
  value={appointment.status}
  onValueChange={(value) => handleStatusChange(appointment.id, value)}
>
  <SelectTrigger className="h-7 w-[140px] text-xs">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="PENDING">Pendente</SelectItem>
    <SelectItem value="CONFIRMED">Confirmado</SelectItem>
    <SelectItem value="CANCELED">Cancelado</SelectItem>
    <SelectItem value="NO_SHOW">Faltou</SelectItem>
  </SelectContent>
</Select>
```

Use `useUpdateAppointment` mutation to persist changes.

---

## 7. Patient Search by Phone

In Patients page and API route, extend search to include phone:
```ts
// API: src/app/api/patients/route.ts
where: {
  userId: session.user.id,
  OR: [
    { name: { contains: search, mode: "insensitive" } },
    { phone: { contains: search } },
    { email: { contains: search, mode: "insensitive" } },
  ],
}
```

---

## 8. Consistent Toast Notifications

Ensure ALL mutations show toasts:
- **Create success**: `toast.success("Paciente cadastrado com sucesso")`
- **Update success**: `toast.success("Paciente atualizado com sucesso")`
- **Delete success**: `toast.success("Paciente excluído com sucesso")`
- **Error**: `toast.error("Erro ao cadastrar paciente")` (already in some places, ensure ALL)

Check `use-api.ts` mutations - some have `console.error` but no `toast.error`.

---

## 9. Dark Mode Toggle

Install `next-themes` and add ThemeProvider to providers.tsx:
```tsx
import { ThemeProvider } from "next-themes";

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

Add toggle button in dashboard header:
```tsx
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const { theme, setTheme } = useTheme();
<Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
</Button>
```

---

## 10. WhatsApp Template Preview

In Settings page, add a preview card below the template textareas:
```tsx
const sampleData = {
  nome: "Maria Santos",
  data: "segunda-feira, 24 de fevereiro",
  hora: "14:30",
  clinica: session?.user?.clinicName || "Sua Clínica",
};

const previewMessage = formatMessage(templateValue, sampleData);

<Card className="bg-muted/50">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm">Pré-visualização</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm whitespace-pre-wrap">{previewMessage}</p>
  </CardContent>
</Card>
```

---

## 11. Dynamic Dashboard Trends

In Dashboard API, calculate week-over-week changes:
```ts
// Current week stats
const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

// Previous week stats
const prevWeekStart = subWeeks(currentWeekStart, 1);
const prevWeekEnd = subWeeks(currentWeekEnd, 1);

// Calculate trend
const trend = currentConfirmed - previousConfirmed;
const trendPercent = previousConfirmed > 0
  ? Math.round(((currentConfirmed - previousConfirmed) / previousConfirmed) * 100)
  : 0;
```

Return trend data in API response for each metric.

---

## 12. Focus Ring Indicators

Ensure all interactive elements have visible focus rings. In globals.css:
```css
/* Ensure focus is visible */
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

Check that all shadcn/ui components have `focus-visible:ring-2 focus-visible:ring-ring` classes.
