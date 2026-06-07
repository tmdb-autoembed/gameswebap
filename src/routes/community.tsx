import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listFeed } from "@/lib/community.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostComposer } from "@/components/community/post-composer";
import { FeedCard } from "@/components/community/feed-card";
import { StoryTray } from "@/components/community/story-tray";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, AlertCircle, Trophy, Sparkles, LogIn } from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [
    { title: "Community Feed — Stories, polls, showcases" },
    { name: "description", content: "Share posts, stories, polls and showcases with fellow gamers." },
  ] }),
  component: Community,
});

const TABS = [
  { k: "", L: Sparkles, label: "All", color: "from-fuchsia-500 to-purple-600" },
  { k: "discussion", L: MessageSquare, label: "Discussions", color: "from-blue-500 to-cyan-500" },
  { k: "issue", L: AlertCircle, label: "Issues", color: "from-amber-400 to-rose-500" },
  { k: "showcase", L: Trophy, label: "Showcase", color: "from-emerald-400 to-cyan-500" },
];

function Community() {
  const [type, setType] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const feedFn = useServerFn(listFeed);
  const { data } = useQuery({ queryKey: ["feed", type], queryFn: () => feedFn({ data: { type: type || undefined, limit: 30 } }) });
  const posts = data?.posts ?? [];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <StoryTray authed={!!userId} />
        {userId ? <PostComposer /> : (
          <Link to="/auth" className="glass-strong rounded-2xl p-5 flex items-center gap-3 hover:glow-purple transition">
            <LogIn className="text-primary" />
            <div>
              <p className="font-bold">Sign in to post, react, and follow</p>
              <p className="text-sm text-muted-foreground">Join the community in one click</p>
            </div>
          </Link>
        )}
        <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 pb-1">
          {TABS.map(({ k, L, label, color }) => (
            <button key={k} onClick={() => setType(k)}
              className={`flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-bold uppercase tracking-wider flex-shrink-0 transition ${type === k ? `bg-gradient-to-r ${color} text-white shadow-lg` : "glass text-foreground/70"}`}>
              <L size={14} /> {label}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {posts.map((p: any) => <FeedCard key={p.id} post={p} currentUserId={userId} />)}
          {posts.length === 0 && <p className="text-center text-muted-foreground py-12">No posts yet. Be the first!</p>}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
