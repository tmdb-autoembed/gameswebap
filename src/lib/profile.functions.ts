import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProfileByUsername = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string }) => z.object({ username: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: prof } = await supabaseAdmin.from("community_profiles").select("*").eq("username", data.username).maybeSingle();
    if (!prof) return { profile: null };
    const [{ count: followers }, { count: following }, { count: postCount }] = await Promise.all([
      supabaseAdmin.from("follows").select("id", { count: "exact", head: true }).eq("following_id", prof.user_id),
      supabaseAdmin.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", prof.user_id),
      supabaseAdmin.from("community_posts").select("id", { count: "exact", head: true }).eq("author_id", prof.user_id).eq("status", "active"),
    ]);
    return { profile: { ...prof, followers: followers ?? 0, following: following ?? 0, post_count: postCount ?? 0 } };
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: prof } = await context.supabase.from("community_profiles").select("*").eq("user_id", context.userId).maybeSingle();
    return { profile: prof };
  });

const UpdateProfile = z.object({
  username: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/, "lowercase letters, numbers and underscore only").optional(),
  display_name: z.string().min(1).max(80).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().nullable().optional(),
  cover: z.string().url().nullable().optional(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateProfile.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("community_profiles").update(data).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
