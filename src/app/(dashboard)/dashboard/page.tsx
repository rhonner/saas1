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
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Agendamentos"
          value={data.totalAppointments}
          icon={Calendar}
          className="text-foreground"
        />
        <MetricCard
          title="Taxa de Confirmação"
          value={`${(data.confirmationRate ?? 0).toFixed(1)}%`}
          icon={CheckCircle}
          trend="+2.5% vs semana passada"
          className="text-emerald-500"
        />
        <MetricCard
          title="Taxa de Faltas"
          value={`${(data.noShowRate ?? 0).toFixed(1)}%`}
          icon={XCircle}
          trend="-1.2% vs semana passada"
          className="text-rose-500"
        />
        <MetricCard
          title="Prejuízo Estimado"
          value={`R$ ${(data.estimatedLoss ?? 0).toFixed(2)}`}
          icon={AlertTriangle}
          className="text-rose-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Weekly Stats Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Estatísticas Semanais</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                <XAxis
                  dataKey="week"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
                  }}
                />
                <Legend />
                <Bar
                  dataKey="confirmed"
                  name="Confirmados"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
                <Bar
                  dataKey="noShow"
                  name="Faltas"
                  fill="hsl(var(--destructive))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="col-span-3 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
          <Card className="h-full flex flex-col justify-center bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
            <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
              <div className="p-4 rounded-full bg-green-500/20 mb-4 animate-pulse">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-4xl font-bold text-green-500 mb-1">{data.confirmed}</div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Confirmados</p>
            </CardContent>
          </Card>
          <Card className="h-full flex flex-col justify-center bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
            <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
              <div className="p-4 rounded-full bg-red-500/20 mb-4 animate-pulse">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="text-4xl font-bold text-red-500 mb-1">{data.noShow}</div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Faltas</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
