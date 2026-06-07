import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListReviews, adminSetReviewStatus, adminDeleteReview } from "@/lib/admin.functions";
import { Star, EyeOff, Eye, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reviews")({ component: R });

function R() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListReviews);
  const setFn = useServerFn(adminSetReviewStatus);
  const delFn = useServerFn(adminDeleteReview);
  const { data } = useQuery({ queryKey: ["admin-rev"], queryFn: () => listFn({}) });
  const set = useMutation({ mutationFn: (v: { id: string; status: any }) => setFn({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-rev"] }) });
  const del = useMutation({ mutationFn: (id: string) => delFn({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-rev"] }) });
  return (
    <div>
      <h1 className="text-3xl font-display font-black mb-4">Reviews</h1>
      <div className="space-y-2">
        {(data?.reviews ?? []).map((r: any) => (
          <div key={r.id} className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl">
            <div className="flex-1">
              <p className="text-sm"><strong>{r.author_name}</strong> · <span className="text-yellow-400 inline-flex">{Array.from({length: r.rating}).map((_,i) => <Star key={i} size={12} fill="currentColor" />)}</span></p>
              <p className="text-sm mt-1">{r.comment}</p>
              <p className="text-xs text-muted-foreground mt-1">{r.status}</p>
            </div>
            <button onClick={() => set.mutate({ id: r.id, status: r.status === "approved" ? "hidden" : "approved" })} className="h-9 w-9 rounded bg-secondary inline-flex items-center justify-center">{r.status === "approved" ? <Eye size={14} /> : <EyeOff size={14} />}</button>
            <button onClick={() => del.mutate(r.id)} className="h-9 w-9 rounded bg-destructive text-destructive-foreground inline-flex items-center justify-center"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
