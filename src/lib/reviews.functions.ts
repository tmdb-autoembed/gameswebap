import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listReviews = createServerFn({ method: "POST" })
  .inputValidator((d: { postId: string }) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin.from("reviews")
      .select("*").eq("post_id", data.postId).eq("status", "approved")
      .order("created_at", { ascending: false });
    return { reviews: rows ?? [] };
  });

const NewReview = z.object({
  postId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const addReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => NewReview.parse(d))
  .handler(async ({ data, context }) => {
    const { data: prof } = await context.supabase.from("community_profiles").select("display_name,username").eq("user_id", context.userId).maybeSingle();
    const name = prof?.display_name || prof?.username || "User";
    const { error } = await context.supabase.from("reviews").insert({
      post_id: data.postId, user_id: context.userId, author_name: name, rating: data.rating, comment: data.comment ?? null,
    });
    if (error) throw new Error(error.message);

    // recompute aggregate on post
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rs } = await supabaseAdmin.from("reviews").select("rating").eq("post_id", data.postId).eq("status", "approved");
    const arr = (rs ?? []).map((r) => r.rating);
    const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    await supabaseAdmin.from("posts").update({ rating: avg, reviews: arr.length }).eq("id", data.postId);

    return { ok: true };
  });
