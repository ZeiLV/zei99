import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading, connectionError } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E]">
        <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-white animate-spin" />
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <h1 className="font-display text-lg tracking-widest text-neon">CLOUD BILAN ALOQA YO'Q</h1>
        <p className="max-w-sm text-sm text-muted-foreground">Akkaunt va anime katalogini ochish uchun Lovable Cloud faol bo'lishi kerak.</p>
        <button type="button" onClick={() => window.location.reload()} className="rounded-md border border-neon/40 px-4 py-2 text-xs font-display tracking-widest text-neon">QAYTA URINISH</button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
