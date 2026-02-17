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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, parseISO, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

export default function AgendaPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

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

  const handleOpenDialog = (appointment?: any) => {
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

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      await deleteMutation.mutateAsync(id);
      setDialogOpen(false);
    }
  };

  const handleStatusChange = async (appointment: any, newStatus: string) => {
    await updateMutation.mutateAsync({
      ...appointment,
      status: newStatus,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">Gerencie seus agendamentos</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
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
                    onClick={() => handleDelete(selectedAppointment.id)}
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
      </div>

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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {weekDays.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayAppointments = appointmentsByDay[dayKey] || [];
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

            return (
              <Card key={dayKey} className={isToday ? "border-primary" : ""}>
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
                            onClick={() => handleOpenDialog(appointment)}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
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
    </div>
  );
}
