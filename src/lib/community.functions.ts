import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public feed ----------
export const listFeed = createServerFn({ method: "POST" })
  .inputValidator((d: { type?: string; limit?: number; offset?: number; gameId?: string; authorId?: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("community_posts")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .eq("visibility", "public")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (data.type) q = q.eq("type", data.type);
    if (data.gameId) q = q.eq("game_id", data.gameId);
    if (data.authorId) q = q.eq("author_id", data.authorId);
    q = q.range(data.offset ?? 0, (data.offset ?? 0) + (data.limit ?? 20) - 1);
    const { data: rows, count, error } = await q;
    if (error) throw new Error(error.message);

    // Enrich with author profiles
    const authorIds = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
    const { data: profiles } = authorIds.length
      ? await supabaseAdmin.from("community_profiles").select("user_id,username,display_name,avatar").in("user_id", authorIds)
      : { data: [] as any[] };
    const map: Record<string, any> = {};
    for (const p of profiles ?? []) map[p.user_id] = p;
    const enriched = (rows ?? []).map((r) => ({ ...r, author: map[r.author_id] ?? null }));
    return { posts: enriched, total: count ?? 0 };
  });

export const getCommunityPost = createServerFn({ method: "POST" })
  .inputValidator((d: { id?: string; slug?: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin.from("community_posts").select("*").eq("status", "active");
    if (data.id) q = q.eq("id", data.id);
    else if (data.slug) q = q.eq("slug", data.slug);
    const { data: row } = await q.maybeSingle();
    if (!row) return { post: null };
    const { data: author } = await supabaseAdmin
      .from("community_profiles").select("user_id,username,display_name,avatar,bio")
      .eq("user_id", row.author_id).maybeSingle();
    return { post: { ...row, author } };
  });

// ---------- Create / mutate ----------
const CreatePost = z.object({
  type: z.enum(["discussion", "issue", "showcase"]).default("discussion"),
  content: z.string().min(1).max(10000),
  title: z.string().max(200).optional(),
  images: z.array(z.string().url()).max(8).default([]),
  links: z.array(z.string().url()).max(8).default([]),
  feeling: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  gameId: z.string().uuid().optional(),
  poll: z.object({
    question: z.string().min(1).max(300),
    options: z.array(z.string().min(1).max(120)).min(2).max(6),
  }).optional(),
});

export const createCommunityPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreatePost.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("community_posts").insert({
      author_id: context.userId,
      type: data.type,
      title: data.title ?? null,
      content: data.content,
      images: data.images,
      links: data.links,
      feeling: data.feeling ?? null,
      location: data.location ?? null,
      game_id: data.gameId ?? null,
    }).select("id").single();
    if (error) throw new Error(error.message);

    if (data.poll) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: poll } = await supabaseAdmin.from("polls").insert({
        community_post_id: row.id,
        question: data.poll.question,
      }).select("id").single();
      if (poll) {
        await supabaseAdmin.from("poll_options").insert(
          data.poll.options.map((option_text, i) => ({ poll_id: poll.id, option_text, sort_order: i })),
        );
      }
    }
    return { id: row.id };
  });

export const deleteCommunityPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("community_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Reactions ----------
export const reactToPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { postId: string; type: string | null }) =>
    z.object({ postId: z.string().uuid(), type: z.enum(["like","love","wow","sad","angry","haha"]).nullable() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.type === null) {
      await context.supabase.from("post_reactions").delete().eq("community_post_id", data.postId).eq("user_id", context.userId);
    } else {
      await context.supabase.from("post_reactions").upsert(
        { community_post_id: data.postId, user_id: context.userId, type: data.type },
        { onConflict: "community_post_id,user_id" },
      );
    }
    // Recompute aggregate
    const { data: rxs } = await supabaseAdmin.from("post_reactions").select("type").eq("community_post_id", data.postId);
    const agg: Record<string, number> = {};
    for (const r of rxs ?? []) agg[r.type] = (agg[r.type] ?? 0) + 1;
    const likes = Object.values(agg).reduce((a, b) => a + b, 0);
    await supabaseAdmin.from("community_posts").update({ reactions: agg, likes }).eq("id", data.postId);
    return { reactions: agg, likes };
  });

export const myReaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { postId: string }) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("post_reactions").select("type").eq("community_post_id", data.postId).eq("user_id", context.userId).maybeSingle();
    return { type: row?.type ?? null };
  });

// ---------- Comments ----------
export const listComments = createServerFn({ method: "POST" })
  .inputValidator((d: { postId: string }) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin.from("post_comments")
      .select("*").eq("community_post_id", data.postId).order("created_at", { ascending: true });
    const authorIds = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
    const { data: profs } = authorIds.length
      ? await supabaseAdmin.from("community_profiles").select("user_id,username,display_name,avatar").in("user_id", authorIds)
      : { data: [] as any[] };
    const map: Record<string, any> = {};
    for (const p of profs ?? []) map[p.user_id] = p;
    return { comments: (rows ?? []).map((r) => ({ ...r, author: map[r.author_id] ?? null })) };
  });

export const addComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { postId: string; content: string; parentId?: string }) =>
    z.object({ postId: z.string().uuid(), content: z.string().min(1).max(2000), parentId: z.string().uuid().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("post_comments").insert({
      community_post_id: data.postId, author_id: context.userId, content: data.content, parent_id: data.parentId ?? null,
    });
    if (error) throw new Error(error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.rpc("bump_community_counter", { _post: data.postId, _col: "comments_count", _delta: 1 } as any).then(() => {}).catch(() => {});
    return { ok: true };
  });

// ---------- Polls ----------
export const getPoll = createServerFn({ method: "POST" })
  .inputValidator((d: { postId: string }) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: poll } = await supabaseAdmin.from("polls").select("*").eq("community_post_id", data.postId).maybeSingle();
    if (!poll) return { poll: null };
    const { data: opts } = await supabaseAdmin.from("poll_options").select("*").eq("poll_id", poll.id).order("sort_order");
    return { poll, options: opts ?? [] };
  });

export const votePoll = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { optionId: string }) => z.object({ optionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // remove prior vote in same poll
    const { data: opt } = await supabaseAdmin.from("poll_options").select("poll_id").eq("id", data.optionId).maybeSingle();
    if (!opt) throw new Error("Option missing");
    const { data: peers } = await supabaseAdmin.from("poll_options").select("id").eq("poll_id", opt.poll_id);
    const peerIds = (peers ?? []).map((p) => p.id);
    if (peerIds.length) {
      await context.supabase.from("poll_votes").delete().eq("user_id", context.userId).in("poll_option_id", peerIds);
    }
    await context.supabase.from("poll_votes").insert({ poll_option_id: data.optionId, user_id: context.userId });
    // recompute counts
    for (const id of peerIds) {
      const { count } = await supabaseAdmin.from("poll_votes").select("id", { count: "exact", head: true }).eq("poll_option_id", id);
      await supabaseAdmin.from("poll_options").update({ votes: count ?? 0 }).eq("id", id);
    }
    return { ok: true };
  });

// ---------- Follow ----------
export const toggleFollow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { targetId: string }) => z.object({ targetId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.targetId === context.userId) return { following: false };
    const { data: existing } = await context.supabase.from("follows")
      .select("id").eq("follower_id", context.userId).eq("following_id", data.targetId).maybeSingle();
    if (existing) {
      await context.supabase.from("follows").delete().eq("id", existing.id);
      return { following: false };
    }
    await context.supabase.from("follows").insert({ follower_id: context.userId, following_id: data.targetId });
    return { following: true };
  });

export const isFollowing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { targetId: string }) => z.object({ targetId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase.from("follows")
      .select("id").eq("follower_id", context.userId).eq("following_id", data.targetId).maybeSingle();
    return { following: !!row };
  });

// ---------- Stories ----------
const StoryInput = z.object({
  image_url: z.string().url().nullable().optional(),
  video_url: z.string().url().nullable().optional(),
  text: z.string().max(500).nullable().optional(),
  background: z.string().max(40).nullable().optional(),
});

export const listStories = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: rows } = await supabaseAdmin.from("stories")
    .select("*").gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false });
  const authorIds = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
  const { data: profs } = authorIds.length
    ? await supabaseAdmin.from("community_profiles").select("user_id,username,display_name,avatar").in("user_id", authorIds)
    : { data: [] as any[] };
  const map: Record<string, any> = {};
  for (const p of profs ?? []) map[p.user_id] = p;
  // group by author, latest first
  const grouped: Record<string, any> = {};
  for (const r of rows ?? []) {
    const key = r.author_id;
    if (!grouped[key]) grouped[key] = { author: map[key], items: [] };
    grouped[key].items.push(r);
  }
  return { groups: Object.values(grouped) };
});

export const createStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => StoryInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("stories").insert({
      author_id: context.userId,
      image_url: data.image_url ?? null,
      video_url: data.video_url ?? null,
      text: data.text ?? null,
      background: data.background ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Search community + games ----------
export const globalSearch = createServerFn({ method: "POST" })
  .inputValidator((d: { q: string }) => z.object({ q: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const like = `%${data.q}%`;
    const [{ data: games }, { data: cposts }, { data: profs }] = await Promise.all([
      supabaseAdmin.from("posts").select("slug,title,kind,cover_url").eq("status", "published").ilike("title", like).limit(6),
      supabaseAdmin.from("community_posts").select("id,title,content").eq("status", "active").or(`title.ilike.${like},content.ilike.${like}`).limit(6),
      supabaseAdmin.from("community_profiles").select("user_id,username,display_name,avatar").or(`username.ilike.${like},display_name.ilike.${like}`).limit(6),
    ]);
    return { games: games ?? [], posts: cposts ?? [], people: profs ?? [] };
  });
