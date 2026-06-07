import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const me = context.userId;
    const { data: msgs } = await supabaseAdmin.from("messages")
      .select("*").or(`sender_id.eq.${me},recipient_id.eq.${me}`)
      .order("created_at", { ascending: false }).limit(200);
    const byPeer: Record<string, any> = {};
    for (const m of msgs ?? []) {
      const peer = m.sender_id === me ? m.recipient_id : m.sender_id;
      if (!byPeer[peer]) byPeer[peer] = { peer_id: peer, last: m, unread: 0 };
      if (!m.is_read && m.recipient_id === me) byPeer[peer].unread += 1;
    }
    const peerIds = Object.keys(byPeer);
    const { data: profs } = peerIds.length
      ? await supabaseAdmin.from("community_profiles").select("user_id,username,display_name,avatar").in("user_id", peerIds)
      : { data: [] as any[] };
    const map: Record<string, any> = {};
    for (const p of profs ?? []) map[p.user_id] = p;
    return { conversations: Object.values(byPeer).map((c: any) => ({ ...c, peer: map[c.peer_id] ?? null })) };
  });

export const listMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { peerId: string }) => z.object({ peerId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const me = context.userId;
    const { data: msgs } = await context.supabase.from("messages")
      .select("*")
      .or(`and(sender_id.eq.${me},recipient_id.eq.${data.peerId}),and(sender_id.eq.${data.peerId},recipient_id.eq.${me})`)
      .order("created_at", { ascending: true });
    // mark received as read
    await context.supabase.from("messages").update({ is_read: true })
      .eq("recipient_id", me).eq("sender_id", data.peerId).eq("is_read", false);
    return { messages: msgs ?? [] };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { peerId: string; content: string }) =>
    z.object({ peerId: z.string().uuid(), content: z.string().min(1).max(4000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("messages").insert({
      sender_id: context.userId, recipient_id: data.peerId, content: data.content,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
