"use client";

import { useSettings, useUpdateSettings } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

const settingsSchema = z.object({
  confirmationHoursBefore: z.number().min(1, "Mínimo de 1 hora").max(168, "Máximo de 7 dias (168 horas)"),
  reminderHoursBefore: z.number().min(1, "Mínimo de 1 hora").max(168, "Máximo de 7 dias (168 horas)"),
  confirmationMessage: z.string().min(10, "Template deve ter no mínimo 10 caracteres"),
  reminderMessage: z.string().min(10, "Template deve ter no mínimo 10 caracteres"),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function ConfiguracoesPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      confirmationHoursBefore: 24,
      reminderHoursBefore: 6,
      confirmationMessage: "",
      reminderMessage: "",
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        confirmationHoursBefore: settings.confirmationHoursBefore,
        reminderHoursBefore: settings.reminderHoursBefore,
        confirmationMessage: settings.confirmationMessage,
        reminderMessage: settings.reminderMessage,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsForm) => {
    await updateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Horários de Notificação */}
        <Card>
          <CardHeader>
            <CardTitle>Horários de Notificação</CardTitle>
            <CardDescription>
              Configure quando as notificações devem ser enviadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmationHoursBefore">
                Antecedência para confirmação (horas)
              </Label>
              <Input
                id="confirmationHoursBefore"
                type="number"
                min="1"
                max="168"
                placeholder="24"
                {...register("confirmationHoursBefore", { valueAsNumber: true })}
              />
              {errors.confirmationHoursBefore && (
                <p className="text-sm text-destructive">
                  {errors.confirmationHoursBefore.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Exemplo: 24 horas = enviar confirmação 1 dia antes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderHoursBefore">
                Antecedência para lembrete (horas)
              </Label>
              <Input
                id="reminderHoursBefore"
                type="number"
                min="1"
                max="168"
                placeholder="2"
                {...register("reminderHoursBefore", { valueAsNumber: true })}
              />
              {errors.reminderHoursBefore && (
                <p className="text-sm text-destructive">
                  {errors.reminderHoursBefore.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Exemplo: 2 horas = enviar lembrete se não confirmou após 2h
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Templates de Mensagem */}
        <Card>
          <CardHeader>
            <CardTitle>Templates de Mensagem</CardTitle>
            <CardDescription>
              Personalize as mensagens enviadas aos pacientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium mb-2">
                Variáveis disponíveis:
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {"{nome}"}
                </Badge>
                <Badge variant="secondary">
                  {"{data}"}
                </Badge>
                <Badge variant="secondary">
                  {"{hora}"}
                </Badge>
                <Badge variant="secondary">
                  {"{clinica}"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmationMessage">
                Template de confirmação
              </Label>
              <Textarea
                id="confirmationMessage"
                rows={5}
                placeholder="Olá {nome}! Você tem consulta agendada em {clinica} no dia {data} às {hora}. Confirma sua presença? Responda SIM ou NÃO."
                {...register("confirmationMessage")}
              />
              {errors.confirmationMessage && (
                <p className="text-sm text-destructive">
                  {errors.confirmationMessage.message}
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="reminderMessage">Template de lembrete</Label>
              <Textarea
                id="reminderMessage"
                rows={5}
                placeholder="Oi {nome}! Ainda não recebemos sua confirmação para a consulta de amanhã ({data} às {hora}). Confirma sua presença? Responda SIM ou NÃO."
                {...register("reminderMessage")}
              />
              {errors.reminderMessage && (
                <p className="text-sm text-destructive">
                  {errors.reminderMessage.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Conexão WhatsApp</CardTitle>
            <CardDescription>
              Status da integração com WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium">Conexão não configurada</p>
                <p className="text-sm text-muted-foreground">
                  Configure a API do WhatsApp para enviar notificações
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
