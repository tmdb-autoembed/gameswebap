import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListRequests, adminSetRequestStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/requests")({ component: R });

const STATES = ["pending", "approved", "added", "rejected"] as const;
function R() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListRequests);
  const setFn = useServerFn(adminSetRequestStatus);
  const { data } = useQuery({ queryKey: ["admin-reqs"], queryFn: () => listFn({}) });
  const set = useMutation({ mutationFn: (v: { id: string; status: any }) => setFn({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reqs"] }) });
  return (
    <div>
      <h1 className="text-3xl font-display font-black mb-4">Game requests</h1>
      <div className="space-y-2">
        {(data?.requests ?? []).map((r: any) => (
          <div key={r.id} className="p-3 bg-card border border-border rounded-xl">
            <p className="font-bold">{r.title}</p>
            {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
            <div className="flex gap-1.5 mt-2">
              {STATES.map((s) => (
                <button key={s} onClick={() => set.mutate({ id: r.id, status: s })}
                  className={`px-3 h-8 text-xs rounded-full font-bold ${r.status === s ? "community-btn text-white" : "bg-secondary text-foreground/70"}`}>{s}</button>
              ))}
              <span className="ml-auto text-sm text-muted-foreground">{r.votes} votes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
