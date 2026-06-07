import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPoll, votePoll } from "@/lib/community.functions";
import { BarChart3 } from "lucide-react";

export function PollBlock({ postId }: { postId: string }) {
  const qc = useQueryClient();
  const getFn = useServerFn(getPoll);
  const voteFn = useServerFn(votePoll);
  const { data } = useQuery({ queryKey: ["poll", postId], queryFn: () => getFn({ data: { postId } }) });
  const vote = useMutation({
    mutationFn: (optionId: string) => voteFn({ data: { optionId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poll", postId] }),
  });
  if (!data?.poll) return null;
  const total = (data.options ?? []).reduce((s: number, o: any) => s + o.votes, 0) || 1;
  return (
    <div className="mx-4 my-3 p-4 rounded-xl glass">
      <p className="font-bold mb-3 flex items-center gap-2"><BarChart3 size={16} className="text-brand-cyan" /> {data.poll.question}</p>
      <div className="space-y-2">
        {data.options.map((o: any) => {
          const pct = Math.round((o.votes / total) * 100);
          return (
            <button key={o.id} onClick={() => vote.mutate(o.id)} disabled={vote.isPending}
              className="w-full relative overflow-hidden rounded-lg border border-border bg-secondary/40 hover:border-primary text-left">
              <span className="absolute inset-y-0 left-0 gradient-purple-pink opacity-30" style={{ width: `${pct}%` }} />
              <span className="relative flex items-center justify-between px-3 py-2 text-sm font-medium">
                <span>{o.option_text}</span>
                <span className="text-xs text-muted-foreground">{o.votes} · {pct}%</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
