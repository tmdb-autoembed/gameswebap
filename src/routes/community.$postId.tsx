import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCommunityPost, listComments, addComment } from "@/lib/community.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FeedCard } from "@/components/community/feed-card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";

export const Route = createFileRoute("/community/$postId")({
  component: PostDetail,
});

function PostDetail() {
  const { postId } = Route.useParams();
  const qc = useQueryClient();
  const getFn = useServerFn(getCommunityPost);
  const listFn = useServerFn(listComments);
  const addFn = useServerFn(addComment);
  const [userId, setUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null)); }, []);

  const { data: postData } = useQuery({ queryKey: ["cp", postId], queryFn: () => getFn({ data: { id: postId } }) });
  const { data: cmts } = useQuery({ queryKey: ["cmts", postId], queryFn: () => listFn({ data: { postId } }) });
  const add = useMutation({
    mutationFn: () => addFn({ data: { postId, content: draft } }),
    onSuccess: () => { setDraft(""); qc.invalidateQueries({ queryKey: ["cmts", postId] }); },
  });

  const p = postData?.post;
  if (!p) return <div className="min-h-screen"><SiteHeader /><p className="p-10 text-center text-muted-foreground">Loading…</p></div>;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <FeedCard post={p} currentUserId={userId} />
        <section className="glass-strong rounded-2xl p-4 space-y-3">
          <h2 className="font-display font-bold">Comments ({cmts?.comments?.length ?? 0})</h2>
          {userId ? (
            <div className="flex gap-2">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a comment..." className="flex-1 h-10 px-3 rounded-full bg-secondary outline-none" />
              <button onClick={() => add.mutate()} disabled={!draft.trim()} className="community-btn h-10 w-10 rounded-full text-white flex items-center justify-center disabled:opacity-50"><Send size={16} /></button>
            </div>
          ) : <Link to="/auth" className="text-sm text-primary">Sign in to comment</Link>}
          <div className="space-y-3 pt-2">
            {(cmts?.comments ?? []).map((c: any) => (
              <div key={c.id} className="flex gap-2">
                <Link to="/profile/$username" params={{ username: c.author?.username ?? "user" }} className="flex-shrink-0">
                  {c.author?.avatar
                    ? <img src={c.author.avatar} className="w-9 h-9 rounded-full object-cover" />
                    : <span className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">{(c.author?.display_name ?? "U").slice(0,2).toUpperCase()}</span>}
                </Link>
                <div className="flex-1 glass rounded-2xl px-3 py-2">
                  <p className="text-xs font-semibold">{c.author?.display_name ?? "User"}</p>
                  <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
