"use client";

import { useState, useMemo } from "react";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
  usePatients,
} from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ChevronLeft, ChevronRight, Calendar, Clock, CalendarPlus, MoreVertical } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, parseISO, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/layout/page-header";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  date: z.string().min(1, "Informe a data"),
  time: z.string().min(1, "Informe o horário"),
  notes: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "PENDING":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "NO_SHOW":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    case "CANCELED":
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
}

function getStatusLabel(status: string) {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "Confirmado";
    case "PENDING":
      return "Pendente";
    case "NO_SHOW":
      return "Faltou";
    case "CANCELED":
      return "Cancelado";
    case "COMPLETED":
      return "Concluído";
    default:
      return status;
  }
}

const statusOptions = [
  { value: "PENDING", label: "Pendente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "CANCELED", label: "Cancelado" },
  { value: "NO_SHOW", label: "Faltou" },
];

export default function AgendaPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string;
    dateTime: string;
    patientId: string;
    notes?: string | null;
    status: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });

  const { data: appointments, isLoading } = useAppointments({
    startDate: format(weekStart, "yyyy-MM-dd"),
    endDate: format(weekEnd, "yyyy-MM-dd"),
  });

  const { data: patients } = usePatients();
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
  });

  const weekDays = useMemo(() => {
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [weekStart, weekEnd]);

  const appointmentsByDay = useMemo(() => {
    if (!appointments) return {};

    return appointments.reduce((acc, appointment) => {
      const day = format(parseISO(appointment.dateTime), "yyyy-MM-dd");
      if (!acc[day]) acc[day] = [];
      acc[day].push(appointment);
      return acc;
    }, {} as Record<string, typeof appointments>);
  }, [appointments]);

  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  const handleOpenDialog = (appointment?: typeof selectedAppointment) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      const appointmentDate = parseISO(appointment.dateTime);
      reset({
        patientId: appointment.patientId,
        date: format(appointmentDate, "yyyy-MM-dd"),
        time: format(appointmentDate, "HH:mm"),
        notes: appointment.notes || "",
      });
    } else {
      setSelectedAppointment(null);
      reset({
        patientId: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "",
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const onSubmit = async (data: AppointmentForm) => {
    try {
      const dateTime = new Date(`${data.date}T${data.time}:00`).toISOString();

      if (selectedAppointment) {
        await updateMutation.mutateAsync({
          id: selectedAppointment.id,
          patientId: data.patientId,
          dateTime,
          notes: data.notes,
        });
      } else {
        await createMutation.mutateAsync({
          patientId: data.patientId,
          dateTime,
          notes: data.notes,
        });
      }
      setDialogOpen(false);
      reset();
    } catch (error) {
      console.error("Error saving appointment:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget);
      setDeleteTarget(null);
      setDialogOpen(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    await updateMutation.mutateAsync({
      id: appointmentId,
      status: newStatus,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description="Gerencie seus agendamentos"
        action={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        }
      />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedAppointment ? "Editar" : "Novo"} Agendamento
              </DialogTitle>
              <DialogDescription>
                {selectedAppointment
                  ? "Atualize as informações do agendamento"
                  : "Preencha os dados para criar um novo agendamento"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Paciente</Label>
                <Controller
                  name="patientId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients?.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.patientId && (
                  <p className="text-sm text-destructive">
                    {errors.patientId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date")}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  {...register("time")}
                />
                {errors.time && (
                  <p className="text-sm text-destructive">
                    {errors.time.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações adicionais..."
                  {...register("notes")}
                />
              </div>

              <DialogFooter className="gap-2">
                {selectedAppointment && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteTarget(selectedAppointment.id)}
                  >
                    Excluir
                  </Button>
                )}
                <Button type="submit">
                  {selectedAppointment ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {format(weekStart, "dd MMM", { locale: ptBR })} -{" "}
            {format(weekEnd, "dd MMM yyyy", { locale: ptBR })}
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week View */}
      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !appointments || appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <CalendarPlus className="h-16 w-16 text-muted-foreground/50" />
          <div className="text-center">
            <p className="font-medium text-lg">Nenhum agendamento nesta semana</p>
            <p className="text-sm text-muted-foreground">
              Agende sua primeira consulta para começar
            </p>
          </div>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {weekDays.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayAppointments = appointmentsByDay[dayKey] || [];
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

            return (
              <Card key={dayKey} className={`transition-shadow duration-200 hover:shadow-md ${isToday ? "border-primary" : ""}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    {isToday && (
                      <Badge variant="secondary" className="ml-2">
                        Hoje
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dayAppointments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum agendamento
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {dayAppointments
                        .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
                        .map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-sm cursor-pointer"
                          >
                            <div
                              className="flex items-center gap-4 flex-1 cursor-pointer"
                              onClick={() => handleOpenDialog(appointment)}
                            >
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {format(parseISO(appointment.dateTime), "HH:mm")}
                                </span>
                              </div>
                              <span className="font-medium">
                                {appointment.patient?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusLabel(appointment.status)}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Alterar status</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {statusOptions
                                    .filter((s) => s.value !== appointment.status)
                                    .map((option) => (
                                      <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleStatusChange(appointment.id, option.value)}
                                      >
                                        <Badge className={`${getStatusColor(option.value)} mr-2`}>
                                          {option.label}
                                        </Badge>
                                      </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
