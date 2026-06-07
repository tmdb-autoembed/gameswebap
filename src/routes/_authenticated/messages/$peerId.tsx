import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMessages, sendMessage } from "@/lib/messages.functions";
import { SiteHeader } from "@/components/site-header";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/messages/$peerId")({
  component: Conversation,
});

function Conversation() {
  const { peerId } = Route.useParams();
  const qc = useQueryClient();
  const listFn = useServerFn(listMessages);
  const sendFn = useServerFn(sendMessage);
  const [me, setMe] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null)); }, []);

  const { data } = useQuery({
    queryKey: ["msgs", peerId],
    queryFn: () => listFn({ data: { peerId } }),
    refetchInterval: 5000,
  });

  const send = useMutation({
    mutationFn: () => sendFn({ data: { peerId, content: draft } }),
    onSuccess: () => { setDraft(""); qc.invalidateQueries({ queryKey: ["msgs", peerId] }); },
  });

  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight }); }, [data]);

  const msgs = data?.messages ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 flex flex-col">
        <Link to="/messages" className="flex items-center gap-2 text-sm text-muted-foreground mb-3"><ArrowLeft size={14} /> Back</Link>
        <div ref={ref} className="flex-1 overflow-y-auto space-y-2 pb-3 max-h-[70vh]">
          {msgs.map((m: any) => {
            const mine = m.sender_id === me;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${mine ? "community-btn text-white rounded-br-md" : "glass rounded-bl-md"}`}>
                  {m.content}
                </div>
              </div>
            );
          })}
          {msgs.length === 0 && <p className="text-center text-muted-foreground py-12">Say hi.</p>}
        </div>
        <div className="flex gap-2 sticky bottom-0">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && draft && send.mutate()}
            placeholder="Type a message..." className="flex-1 h-11 px-4 rounded-full bg-secondary outline-none" />
          <button onClick={() => send.mutate()} disabled={!draft.trim()} className="community-btn h-11 w-11 rounded-full text-white flex items-center justify-center disabled:opacity-50">
            <Send size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}
