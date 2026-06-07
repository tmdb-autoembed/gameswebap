import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListComments, adminDeleteComment } from "@/lib/admin.functions";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/comments")({ component: C });

function C() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListComments);
  const delFn = useServerFn(adminDeleteComment);
  const { data } = useQuery({ queryKey: ["admin-cmts"], queryFn: () => listFn({}) });
  const del = useMutation({ mutationFn: (id: string) => delFn({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-cmts"] }) });
  return (
    <div>
      <h1 className="text-3xl font-display font-black mb-4">Comments</h1>
      <div className="space-y-2">
        {(data?.comments ?? []).map((c: any) => (
          <div key={c.id} className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl">
            <div className="flex-1"><p className="text-sm">{c.content}</p><p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString()}</p></div>
            <button onClick={() => del.mutate(c.id)} className="h-9 w-9 rounded bg-destructive text-destructive-foreground inline-flex items-center justify-center"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
