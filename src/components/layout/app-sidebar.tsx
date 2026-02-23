"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Pacientes", href: "/pacientes", icon: Users },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

type AppSidebarProps = {
  pathname: string;
  onNavigate?: () => void;
};

export function AppSidebar({ pathname, onNavigate }: AppSidebarProps) {
  return (
    <div className="flex h-full flex-col glass-sidebar">
      {/* Logo */}
      <div className="border-b border-sidebar-border p-6 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">C</span>
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal-400">
          ConfirmaAí
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 border border-transparent",
                "animate-slide-in-left opacity-0",
                isActive
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
            >
              {isActive && (
                <div className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary animate-scale-in" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                  isActive && "text-primary"
                )}
              />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <ChevronRight className="h-4 w-4 animate-fade-in text-primary/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Plan Card */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-teal-500/10 p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            Plano Pro
          </p>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-teal-400 w-[75%] rounded-full transition-all duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
