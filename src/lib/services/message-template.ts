import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type MessageData = {
  nome: string;
  data: string;
  hora: string;
  clinica: string;
};

export function formatMessage(template: string, data: MessageData): string {
  return template
    .replace(/{nome}/g, data.nome)
    .replace(/{data}/g, data.data)
    .replace(/{hora}/g, data.hora)
    .replace(/{clinica}/g, data.clinica);
}

export function formatAppointmentDate(dateTime: Date): string {
  return format(dateTime, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatAppointmentTime(dateTime: Date): string {
  return format(dateTime, "HH:mm");
}
