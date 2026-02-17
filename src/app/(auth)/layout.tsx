"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-primary/20 blur-[150px] mix-blend-screen animate-slide-up"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-purple-500/10 blur-[130px] mix-blend-screen"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
            <div className="h-6 w-6 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]"></div>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            ConfirmaAí
          </h1>
        </div>
        <Card className="p-8 border-white/10 shadow-2xl backdrop-blur-3xl bg-card/40">{children}</Card>
      </div>
    </div>
  );
}
