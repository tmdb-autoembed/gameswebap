import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listRequests, createRequest } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Plus, ThumbsUp, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/request-game")({
  head: () => ({ meta: [{ title: "Request a game" }] }),
  component: RequestGame,
});

function RequestGame() {
  const qc = useQueryClient();
  const listFn = useServerFn(listRequests);
  const addFn = useServerFn(createRequest);
  const [authed, setAuthed] = useState(false);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user)); }, []);
  const { data } = useQuery({ queryKey: ["reqs"], queryFn: () => listFn({ data: {} }) });
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const add = useMutation({
    mutationFn: () => addFn({ data: { title, description: desc || undefined } }),
    onSuccess: () => { setTitle(""); setDesc(""); qc.invalidateQueries({ queryKey: ["reqs"] }); },
  });
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h1 className="font-display text-3xl md:text-4xl font-black flex items-center gap-2"><Sparkles className="text-primary" /> Request a game</h1>
        {authed ? (
          <div className="glass-strong rounded-2xl p-4 space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Game title" className="w-full h-11 px-4 rounded-full bg-secondary outline-none" />
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Why should we add it? (optional)" className="w-full p-3 rounded-2xl bg-secondary outline-none resize-none" />
            <button onClick={() => add.mutate()} disabled={!title.trim() || add.isPending} className="community-btn h-10 px-5 rounded-full text-white font-bold inline-flex items-center gap-2 disabled:opacity-50">
              <Plus size={16} /> Submit request
            </button>
          </div>
        ) : <Link to="/auth" className="block glass-strong rounded-2xl p-4 text-center font-bold">Sign in to submit a request</Link>}
        <div className="space-y-3">
          {(data?.requests ?? []).map((r: any) => (
            <div key={r.id} className="glass-strong rounded-2xl p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold">{r.title}</p>
                {r.description && <p className="text-sm text-muted-foreground mt-1">{r.description}</p>}
                <p className="text-xs text-muted-foreground mt-1 capitalize">Status: {r.status}</p>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-brand-pink"><ThumbsUp size={14} /> {r.votes}</span>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
