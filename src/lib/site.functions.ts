import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listRequests = createServerFn({ method: "POST" })
  .inputValidator((d: { status?: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin.from("game_requests").select("*").order("votes", { ascending: false });
    if (data.status) q = q.eq("status", data.status);
    const { data: rows } = await q;
    return { requests: rows ?? [] };
  });

export const createRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { title: string; description?: string }) =>
    z.object({ title: z.string().min(2).max(200), description: z.string().max(2000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("game_requests").insert({
      user_id: context.userId, title: data.title, description: data.description ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Pages (blog/static) ----------
export const listPublicPages = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("site_pages").select("slug,title,cover_image,updated_at").eq("is_published", true).order("updated_at", { ascending: false });
  return { pages: data ?? [] };
});

export const getPublicPage = createServerFn({ method: "POST" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("site_pages").select("*").eq("slug", data.slug).eq("is_published", true).maybeSingle();
    return { page: row };
  });
