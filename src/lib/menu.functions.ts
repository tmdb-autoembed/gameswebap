import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listMenu = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("menu_items").select("*").eq("enabled", true).order("sort_order");
  if (error) throw new Error(error.message);
  return { items: data ?? [] };
});

export const adminListMenu = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("menu_items").select("*").order("sort_order");
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

const MenuInput = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(60),
  href: z.string().min(1).max(200),
  icon: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  sort_order: z.number().int().min(0).max(999),
  enabled: z.boolean(),
});

export const adminSaveMenu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => MenuInput.parse(d))
  .handler(async ({ data, context }) => {
    if (data.id) {
      const { error } = await context.supabase.from("menu_items").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const { error } = await context.supabase.from("menu_items").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteMenu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("menu_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("settings").select("*");
  const map: Record<string, any> = {};
  for (const r of data ?? []) map[r.key] = r.value;
  return { settings: map };
});

export const adminSaveSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string; value: any }) =>
    z.object({ key: z.string().min(1).max(100), value: z.any() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("settings").upsert({ key: data.key, value: data.value, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    const roles = (data ?? []).map((r) => r.role);
    return { roles, isAdmin: roles.includes("admin") };
  });

const defaultMenuItems = [
  { label: "Games", href: "/games", icon: "Gamepad2", color: "#22d3ee", sort_order: 1, enabled: true },
  { label: "Top", href: "/games?sort=rating", icon: "ArrowUp", color: "#f59e0b", sort_order: 2, enabled: true },
  { label: "Trending", href: "/games?sort=popular", icon: "TrendingUp", color: "#ec4899", sort_order: 3, enabled: true },
  { label: "Software", href: "/software", icon: "LayoutGrid", color: "#8b5cf6", sort_order: 4, enabled: true },
  { label: "Apps", href: "/apps", icon: "Smartphone", color: "#3b82f6", sort_order: 5, enabled: true },
  { label: "Console Games", href: "/console-games", icon: "Lock", color: "#10b981", sort_order: 6, enabled: true },
  { label: "Donate", href: "/donate", icon: "Heart", color: "#ec4899", sort_order: 7, enabled: true },
  { label: "Request", href: "/request-game", icon: "MessageSquare", color: "#06b6d4", sort_order: 8, enabled: true },
];

export const adminSeedDefaultMenu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: existing, error: readError } = await context.supabase.from("menu_items").select("href");
    if (readError) throw new Error(readError.message);
    const existingHrefs = new Set((existing ?? []).map((item) => item.href));
    const missing = defaultMenuItems.filter((item) => !existingHrefs.has(item.href));
    if (missing.length === 0) return { inserted: 0 };
    const { error } = await context.supabase.from("menu_items").insert(missing);
    if (error) throw new Error(error.message);
    return { inserted: missing.length };
  });
