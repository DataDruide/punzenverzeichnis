import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("No auth header found");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }


    // Create a client scoped to the calling user to verify identity
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: callingUser }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !callingUser) {
      console.log("getUser error:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userId = callingUser.id;
    console.log("Authenticated user:", userId);

    // Admin client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check admin or superadmin
    const { data: isAdminUser } = await supabaseAdmin.rpc("is_admin_or_above", { _user_id: userId });
    if (!isAdminUser) {
      console.log("User is not admin");
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check if request has a body (action request)
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const text = await req.text();
      if (text) {
        const body = JSON.parse(text);
        const { action, userId: targetUserId, role } = body;

        if (action === "update_role") {
          await supabaseAdmin.from("user_roles").delete().eq("user_id", targetUserId);
          const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: targetUserId, role });
          if (error) throw error;
          return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (action === "delete_user") {
          const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
          if (error) throw error;
          return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
    }

    // GET/default: list users
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
    if (error) throw error;

    const { data: roles } = await supabaseAdmin.from("user_roles").select("*");

    const usersWithRoles = users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      role: roles?.find((r) => r.user_id === u.id)?.role || "user",
    }));

    return new Response(JSON.stringify(usersWithRoles), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Edge function error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
