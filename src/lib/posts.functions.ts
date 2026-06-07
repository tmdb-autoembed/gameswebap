import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PostInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).nullable().optional(),
  kind: z.enum(["games", "software", "apps", "console"]),
  cover_url: z.string().url().nullable().optional(),
  backdrop_url: z.string().url().nullable().optional(),
  description: z.string().max(20000).nullable().optional(),
  size: z.string().max(50).nullable().optional(),
  year: z.number().int().min(1970).max(2100).nullable().optional(),
  developer: z.string().max(200).nullable().optional(),
  publisher: z.string().max(200).nullable().optional(),
  genres: z.array(z.string().max(50)).max(20).default([]),
  requirements: z.record(z.any()).default({}),
  rating: z.number().min(0).max(5).default(0),
  reviews: z.number().int().min(0).default(0),
  source_url: z.string().url().nullable().optional(),
  download_url: z.string().url().nullable().optional(),
  status: z.enum(["draft", "published"]).default("published"),
});

export const listPublicPosts = createServerFn({ method: "POST" })
  .inputValidator((d: {
    kind?: string;
    search?: string;
    genre?: string;
    year?: number;
    sort?: "newest" | "rating" | "popular" | "title";
    limit?: number;
    offset?: number;
  }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin.from("posts").select("*", { count: "exact" }).eq("status", "published");
    if (data.kind) q = q.eq("kind", data.kind);
    if (data.search) q = q.ilike("title", `%${data.search}%`);
    if (data.genre) q = q.contains("genres", [data.genre]);
    if (data.year) q = q.eq("year", data.year);
    const sort = data.sort ?? "newest";
    if (sort === "newest") q = q.order("created_at", { ascending: false });
    else if (sort === "rating") q = q.order("rating", { ascending: false });
    else if (sort === "popular") q = q.order("download_count", { ascending: false, nullsFirst: false });
    else q = q.order("title", { ascending: true });
    q = q.range(data.offset ?? 0, (data.offset ?? 0) + (data.limit ?? 24) - 1);
    const { data: rows, count, error } = await q;
    if (error) throw new Error(error.message);
    return { posts: rows ?? [], total: count ?? 0 };
  });

export const getPostBySlug = createServerFn({ method: "POST" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("posts").select("*").eq("slug", data.slug).eq("status", "published").maybeSingle();
    if (error) throw new Error(error.message);
    return { post: row };
  });

export const searchPosts = createServerFn({ method: "POST" })
  .inputValidator((d: { q: string }) => z.object({ q: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin.from("posts")
      .select("slug,title,kind,cover_url")
      .eq("status", "published")
      .ilike("title", `%${data.q}%`)
      .limit(8);
    return { results: rows ?? [] };
  });

export const getRandomPost = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("status", "published");
  if (!count || count === 0) return { slug: null };
  const offset = Math.floor(Math.random() * count);
  const { data } = await supabaseAdmin.from("posts").select("slug").eq("status", "published").range(offset, offset);
  return { slug: data?.[0]?.slug ?? null };
});

// Admin
export const adminListPosts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { search?: string; limit?: number; offset?: number }) => d)
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("posts").select("*", { count: "exact" }).order("updated_at", { ascending: false });
    if (data.search) q = q.ilike("title", `%${data.search}%`);
    q = q.range(data.offset ?? 0, (data.offset ?? 0) + (data.limit ?? 50) - 1);
    const { data: rows, count, error } = await q;
    if (error) throw new Error(error.message);
    return { posts: rows ?? [], total: count ?? 0 };
  });

export const adminGetPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: post, error } = await context.supabase.from("posts").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return { post };
  });

export const adminSavePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PostInput.parse(d))
  .handler(async ({ data, context }) => {
    if (data.id) {
      const { error } = await context.supabase.from("posts").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await context.supabase.from("posts").insert(data).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
