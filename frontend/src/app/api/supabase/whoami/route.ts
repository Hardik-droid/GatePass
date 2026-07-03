import { withSupabase } from "@supabase/server";

export const GET = withSupabase({ auth: "user" }, async (_req, ctx) => {
  const { data: profile, error } = await ctx.supabase
    .from("users_profile")
    .select("id, name, email, avatar_url")
    .single();

  if (error) {
    return Response.json({ message: error.message }, { status: 400 });
  }

  return Response.json({
    authMode: ctx.authMode,
    user: ctx.userClaims,
    profile,
  });
});

