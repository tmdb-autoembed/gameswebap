import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListCommunity, adminSetCommunityStatus, adminTogglePinned } from "@/lib/admin.functions";
import { Pin, EyeOff, Eye, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/community")({ component: Comm });

function Comm() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListCommunity);
  const setStatusFn = useServerFn(adminSetCommunityStatus);
  const pinFn = useServerFn(adminTogglePinned);
  const { data } = useQuery({ queryKey: ["admin-cp"], queryFn: () => listFn({ data: { limit: 200 } }) });
  const setStatus = useMutation({ mutationFn: (v: { id: string; status: any }) => setStatusFn({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-cp"] }) });
  const pin = useMutation({ mutationFn: (v: { id: string; pinned: boolean }) => pinFn({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-cp"] }) });
  return (
    <div>
      <h1 className="text-3xl font-display font-black mb-4">Community moderation</h1>
      <div className="space-y-2">
        {(data?.posts ?? []).map((p: any) => (
          <div key={p.id} className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-primary font-bold">{p.type} · {p.status}</p>
              {p.title && <p className="font-bold">{p.title}</p>}
              <p className="text-sm text-muted-foreground line-clamp-2">{p.content}</p>
            </div>
            <button onClick={() => pin.mutate({ id: p.id, pinned: !p.is_pinned })} className={`h-9 w-9 rounded ${p.is_pinned ? "bg-primary text-primary-foreground" : "bg-secondary"} inline-flex items-center justify-center`}><Pin size={14} /></button>
            <button onClick={() => setStatus.mutate({ id: p.id, status: p.status === "active" ? "hidden" : "active" })} className="h-9 w-9 rounded bg-secondary inline-flex items-center justify-center">{p.status === "active" ? <Eye size={14} /> : <EyeOff size={14} />}</button>
            <button onClick={() => setStatus.mutate({ id: p.id, status: "deleted" })} className="h-9 w-9 rounded bg-destructive text-destructive-foreground inline-flex items-center justify-center"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
