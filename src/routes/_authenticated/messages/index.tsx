import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listConversations } from "@/lib/messages.functions";
import { SiteHeader } from "@/components/site-header";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/messages/")({
  component: MsgIndex,
});

function MsgIndex() {
  const fn = useServerFn(listConversations);
  const { data } = useQuery({ queryKey: ["convs"], queryFn: () => fn({}) });
  const convs = data?.conversations ?? [];
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-display text-3xl font-black mb-5 flex items-center gap-2"><MessageSquare className="text-primary" /> Messages</h1>
        <div className="space-y-2">
          {convs.map((c: any) => (
            <Link key={c.peer_id} to="/messages/$peerId" params={{ peerId: c.peer_id }}
              className="flex items-center gap-3 p-3 rounded-2xl glass-strong hover:glow-purple transition">
              {c.peer?.avatar
                ? <img src={c.peer.avatar} className="w-12 h-12 rounded-full object-cover" />
                : <span className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-bold">{(c.peer?.display_name ?? "U").slice(0,2).toUpperCase()}</span>}
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{c.peer?.display_name ?? "User"}</p>
                <p className="text-sm text-muted-foreground truncate">{c.last?.content}</p>
              </div>
              {c.unread > 0 && <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">{c.unread}</span>}
            </Link>
          ))}
          {convs.length === 0 && <p className="text-muted-foreground text-center py-12">No conversations yet</p>}
        </div>
      </main>
    </div>
  );
}
