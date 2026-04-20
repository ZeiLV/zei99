import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_PASSWORD = "ZEI99";
const ADMIN_EMAIL = "zei-admin@zei-dubbing.internal";
// Strong fixed internal password for the hidden Supabase user (NOT the gesture password)
const ADMIN_INTERNAL_PASSWORD = "ZeiD!ub_2025#hidden$AdminPortalKey_47291";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Noto'g'ri parol" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Ensure hidden admin user exists
    const { data: list } = await admin.auth.admin.listUsers();
    let userId = list?.users?.find((u) => u.email === ADMIN_EMAIL)?.id;

    if (!userId) {
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_INTERNAL_PASSWORD,
        email_confirm: true,
      });
      if (cErr || !created.user) {
        return new Response(
          JSON.stringify({ error: cErr?.message ?? "Admin yaratilmadi" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = created.user.id;
    }

    // Ensure admin role row exists
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      await admin.from("user_roles").insert({ user_id: userId, role: "admin" });
    }

    // Sign in via anon client to obtain a real session for the browser
    const anon = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: session, error: sErr } = await anon.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_INTERNAL_PASSWORD,
    });

    if (sErr || !session.session) {
      return new Response(
        JSON.stringify({ error: sErr?.message ?? "Sessiya yaratilmadi" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        access_token: session.session.access_token,
        refresh_token: session.session.refresh_token,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
