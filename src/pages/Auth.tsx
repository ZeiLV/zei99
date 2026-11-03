import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { SocialLinks } from "@/components/SocialLinks";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Email noto'g'ri").max(255);
const passwordSchema = z.string().min(6, "Kamida 6 ta belgi").max(72);

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading, connectionError } = useAuth();
  const [stage, setStage] = useState<"intro" | "form" | "leaving">("intro");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const withTimeout = async <T,>(operation: Promise<T>): Promise<T> =>
    Promise.race([
      operation,
      new Promise<T>((_, reject) =>
        window.setTimeout(() => reject(new Error("Cloud timeout")), 10000)
      ),
    ]);

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const goNext = (path = "/") => {
    setStage("leaving");
    setTimeout(() => navigate(path, { replace: true }), 600);
  };

  const handleGoogle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await withTimeout(lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      }));
      if (result.error) {
        toast.error("Google bilan kirishda xatolik");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      goNext();
    } catch {
      toast.error("Cloud bilan aloqa yo'q. Keyinroq qayta urinib ko'ring.");
      setBusy(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const emailParse = emailSchema.safeParse(email);
    const passParse = passwordSchema.safeParse(password);
    if (!emailParse.success) return toast.error(emailParse.error.errors[0].message);
    if (!passParse.success) return toast.error(passParse.error.errors[0].message);

    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await withTimeout(supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name || email.split("@")[0] },
          },
        }));
        if (error) {
          if (error.message.includes("already")) toast.error("Bu email allaqachon ro'yxatdan o'tgan");
          else toast.error(error.message);
          setBusy(false);
          return;
        }
        toast.success("Akkaunt yaratildi!");
      } else {
        const { error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }));
        if (error) {
          toast.error("Email yoki parol noto'g'ri");
          setBusy(false);
          return;
        }
      }
      goNext();
    } catch {
      toast.error("Cloud bilan aloqa yo'q. Keyinroq qayta urinib ko'ring.");
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Kirish — ZEI DUBBING</title>
        <meta name="description" content="ZEI DUBBING — Premium streaming platformaga kirish." />
      </Helmet>

      <div
        className={`min-h-screen flex flex-col bg-background relative overflow-hidden ${
          stage === "leaving" ? "animate-fade-up" : ""
        }`}
      >
        

        <main className="relative flex-1 flex flex-col items-center justify-center px-5 py-10 z-10">
          {connectionError ? (
            <div className="flex max-w-sm flex-col items-center gap-4 text-center animate-fade-up">
              <h1 className="font-display text-xl tracking-normal neon-text">CLOUD BILAN ALOQA YO'Q</h1>
              <p className="text-sm leading-relaxed text-foreground/55">
                Kirish va anime katalogi hozir ochilmaydi. Lovable Cloud qayta yoqilgach sayt avtomatik ishlaydi.
              </p>
              <Button variant="ghost"
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg border border-neon/50 px-5 py-2.5 font-display text-xs tracking-normal text-neon transition-colors hover:bg-neon/10"
              >
                QAYTA URINISH
              </Button>
            </div>
          ) : stage === "intro" && (
            <div className="flex flex-col items-center gap-10 animate-fade-up">
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-foreground tracking-normal text-center">
                ZEI DUBBING
              </h1>

              <p className="text-xs sm:text-sm text-foreground/55 tracking-wide">
                O‘zbek tilida. Yangi tomosha.
              </p>

              <Button variant="ghost"
                onClick={() => setStage("form")}
                className="group relative px-10 py-4 rounded-full font-semibold text-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-3 shadow-lg"
              >
                <span>Boshlash</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <SocialLinks />
            </div>
          )}

          {!connectionError && stage !== "intro" && (
            <div className="w-full flex flex-col items-center animate-zoom-in">
              <div className="text-center mb-8">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-normal">
                  ZEI DUBBING
                </h1>
                <p className="text-[11px] text-foreground/50 mt-2">
                  ZEI / V2
                </p>
              </div>

              <div
                className="w-full max-w-sm rounded-2xl p-6 bg-card border border-border"
              >
                <div className="flex gap-1 p-1 rounded-xl bg-foreground/5 mb-5">
                  <Button variant="ghost"
                    onClick={() => setMode("signin")}
                    className={`flex-1 py-2 rounded-lg text-xs font-display tracking-normal transition-all ${
                      mode === "signin" ? "bg-foreground/10 text-foreground" : "text-foreground/50 hover:text-foreground/80"
                    }`}
                  >
                    KIRISH
                  </Button>
                  <Button variant="ghost"
                    onClick={() => setMode("signup")}
                    className={`flex-1 py-2 rounded-lg text-xs font-display tracking-normal transition-all ${
                      mode === "signup" ? "bg-foreground/10 text-foreground" : "text-foreground/50 hover:text-foreground/80"
                    }`}
                  >
                    RO'YXAT
                  </Button>
                </div>

                <Button variant="ghost"
                  onClick={handleGoogle}
                  disabled={busy}
                  className="w-full h-11 rounded-xl bg-foreground text-background font-medium text-sm flex items-center justify-center gap-3 hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Google bilan davom etish
                </Button>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-foreground/10" />
                  <span className="text-[10px] text-foreground/40 font-display tracking-normal">YOKI</span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>

                <form onSubmit={handleEmail} className="space-y-3">
                  {mode === "signup" && (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ismingiz (ixtiyoriy)"
                      className="w-full h-11 px-4 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/40 outline-none focus:border-neon/50 transition-colors text-sm"
                    />
                  )}
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/40 outline-none focus:border-neon/50 transition-colors text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Parol"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/40 outline-none focus:border-neon/50 transition-colors text-sm"
                    />
                  </div>
                  <Button variant="ghost"
                    type="submit"
                    disabled={busy}
                    className="breathing-btn w-full h-11 rounded-xl bg-primary text-primary-foreground font-display text-xs tracking-normal hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-transform flex items-center justify-center gap-2"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    {mode === "signin" ? "KIRISH" : "RO'YXATDAN O'TISH"}
                  </Button>
                </form>
              </div>

              <div className="mt-8">
                <SocialLinks />
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
