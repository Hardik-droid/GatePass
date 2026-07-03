import { withSupabase } from "@supabase/server";

export const GET = withSupabase({ auth: "secret" }, async (_req, ctx) => {
  const { data, error } = await ctx.supabaseAdmin
    .from("users_profile")
    .select("id, name, email, avatar_url")
    .limit(25);

  if (error) {
    return Response.json({ message: error.message }, { status: 400 });
  }

  return Response.json({
    authMode: ctx.authMode,
    users: data,
  });
});
