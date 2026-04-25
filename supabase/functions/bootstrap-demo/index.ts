// Temporary bootstrap function: creates demo accounts. Callable only by superadmin.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_ACCOUNTS = [
  { email: "demo-admin@zvp-demo.de", password: "DemoAdmin2026!", role: "admin",
    profile: { firmenname: "ZVP Demo Verband", ansprechpartner: "Anna Admin", telefon: "+49 30 1111111", strasse: "Musterstr. 1", plz: "10115", ort: "Berlin", freigeschaltet: true, darf_recherchieren: true } },
  { email: "demo-firma@zvp-demo.de", password: "DemoFirma2026!", role: "user",
    profile: { firmenname: "Goldschmiede Sonnenschein GmbH", ansprechpartner: "Frieda Firma", telefon: "+49 89 2222222", strasse: "Goldgasse 7", plz: "80331", ort: "München", webseite: "https://goldschmiede-sonnenschein.de", freigeschaltet: true, darf_recherchieren: false } },
  { email: "demo-forscher@zvp-demo.de", password: "DemoForscher2026!", role: "user",
    profile: { firmenname: "Universität Beispielstadt", ansprechpartner: "Dr. Felix Forscher", telefon: "+49 40 3333333", strasse: "Wissenschaftspark 5", plz: "20095", ort: "Hamburg", freigeschaltet: true, darf_recherchieren: true, recherche_gueltig_bis: "2027-12-31" } },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isSuper } = await admin.rpc("has_role", { _user_id: user.id, _role: "superadmin" });
    if (!isSuper) return new Response(JSON.stringify({ error: "Forbidden - superadmin only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const results: any[] = [];
    const { data: { users: existing } } = await admin.auth.admin.listUsers({ perPage: 200 });
    for (const acc of DEMO_ACCOUNTS) {
      let userId = existing.find((u: any) => u.email === acc.email)?.id;
      if (!userId) {
        const { data, error } = await admin.auth.admin.createUser({ email: acc.email, password: acc.password, email_confirm: true });
        if (error) { results.push({ email: acc.email, error: error.message }); continue; }
        userId = data.user!.id;
        await new Promise(r => setTimeout(r, 600));
      }
      await admin.from("user_roles").delete().eq("user_id", userId);
      await admin.from("user_roles").insert({ user_id: userId, role: acc.role });
      const { data: prof } = await admin.from("profiles").select("id").eq("user_id", userId).maybeSingle();
      const profileData: any = { ...acc.profile, email_kontakt: acc.email, datenschutz_akzeptiert_am: new Date().toISOString() };
      if (prof) {
        await admin.from("profiles").update(profileData).eq("id", prof.id);
      } else {
        await admin.from("profiles").insert({ user_id: userId, ...profileData });
      }
      results.push({ email: acc.email, password: acc.password, role: acc.role, userId });
    }

    return new Response(JSON.stringify({ success: true, accounts: results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
