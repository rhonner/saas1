"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Menu,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Pacientes", href: "/pacientes", icon: Users },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar/50 backdrop-blur-xl border-r border-sidebar-border/50">
      <div className="border-b border-sidebar-border/50 p-6 flex items-center justify-between group">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
          ConfirmaAí
        </h1>
        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)] animate-pulse"></div>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out border border-transparent overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"
              )}
            >
              {isActive && (
                 <div className="absolute inset-y-0 left-0 w-1 bg-primary shadow-[0_0_10px_var(--color-primary)]" />
              )}
              <Icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive && "text-primary")} />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="h-4 w-4 animate-fade-in" />}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border/50">
         <div className="rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 p-4 border border-white/5">
             <p className="text-xs text-muted-foreground mb-2">Plano Pro</p>
             <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-primary to-purple-500 w-[75%]"></div>
             </div>
         </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, setOpen } = useSidebarStore();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative">
             <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
             <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-purple-500/20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const clinicName = (session.user as any)?.clinicName || "Clínica";

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[100px] mix-blend-screen"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-72 border-r border-sidebar-border/40 bg-background/30 backdrop-blur-xl lg:block z-20 shadow-2xl">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 border-r border-sidebar-border/40 bg-background/80 backdrop-blur-xl">
          <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col z-10 relative">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/40 bg-background/30 backdrop-blur-xl px-4 lg:px-6 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>

          <div className="flex-1">
            <h2 className="text-lg font-semibold tracking-tight">{clinicName}</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span className="text-xs font-medium text-muted-foreground">Online</span>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9"
            >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Alternar tema</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="gap-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto mt-2">
            <div className="animate-fade-in">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}
