import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListReports, adminSetReportStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/reports")({ component: R });

const STATES = ["pending","reviewed","resolved"] as const;
function R() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListReports);
  const setFn = useServerFn(adminSetReportStatus);
  const { data } = useQuery({ queryKey: ["admin-rep"], queryFn: () => listFn({}) });
  const set = useMutation({ mutationFn: (v: { id: string; status: any }) => setFn({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-rep"] }) });
  return (
    <div>
      <h1 className="text-3xl font-display font-black mb-4">Reports</h1>
      <div className="space-y-2">
        {(data?.reports ?? []).map((r: any) => (
          <div key={r.id} className="p-3 bg-card border border-border rounded-xl">
            <p className="text-sm"><strong>Reason:</strong> {r.reason}</p>
            <p className="text-xs text-muted-foreground">post {r.community_post_id} · {new Date(r.created_at).toLocaleString()}</p>
            <div className="flex gap-1.5 mt-2">
              {STATES.map((s) => (
                <button key={s} onClick={() => set.mutate({ id: r.id, status: s })}
                  className={`px-3 h-8 text-xs rounded-full font-bold ${r.status === s ? "community-btn text-white" : "bg-secondary text-foreground/70"}`}>{s}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
