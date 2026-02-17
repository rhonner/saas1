"use client";

import { useDashboard } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  className?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${className}`}>{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

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
    default:
      return status;
  }
}

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-semibold">Erro ao carregar dashboard</p>
          <p className="text-sm text-muted-foreground">
            Tente recarregar a página
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral dos seus agendamentos
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Agendamentos"
          value={data.totalAppointments}
          icon={Calendar}
        />
        <MetricCard
          title="Taxa de Confirmação"
          value={`${(data.confirmationRate ?? 0).toFixed(1)}%`}
          icon={CheckCircle}
          className="text-green-600 dark:text-green-400"
        />
        <MetricCard
          title="Taxa de Faltas"
          value={`${(data.noShowRate ?? 0).toFixed(1)}%`}
          icon={XCircle}
          className="text-red-600 dark:text-red-400"
        />
        <MetricCard
          title="Prejuízo Estimado"
          value={`R$ ${(data.estimatedLoss ?? 0).toFixed(2)}`}
          icon={AlertTriangle}
          className="text-red-600 dark:text-red-400"
        />
      </div>

      {/* Weekly Stats Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Semanais</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="confirmed"
                name="Confirmados"
                fill="hsl(142 76% 36%)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="noShow"
                name="Faltas"
                fill="hsl(0 84% 60%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.confirmed}</div>
              <p className="text-xs text-muted-foreground mt-1">Confirmados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{data.notConfirmed}</div>
              <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{data.noShow}</div>
              <p className="text-xs text-muted-foreground mt-1">Faltas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{data.canceled}</div>
              <p className="text-xs text-muted-foreground mt-1">Cancelados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
