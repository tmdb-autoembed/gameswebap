import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListUsers, adminSetUserRole } from "@/lib/admin.functions";
import { Shield, ShieldOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: U });

function U() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListUsers);
  const setFn = useServerFn(adminSetUserRole);
  const { data } = useQuery({ queryKey: ["admin-users"], queryFn: () => listFn({}) });
  const set = useMutation({ mutationFn: (v: { userId: string; role: "admin"; grant: boolean }) => setFn({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }) });
  return (
    <div>
      <h1 className="text-3xl font-display font-black mb-4">Users</h1>
      <div className="space-y-2">
        {(data?.users ?? []).map((u: any) => {
          const isAdmin = u.roles?.includes("admin");
          return (
            <div key={u.user_id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
              {u.avatar
                ? <img src={u.avatar} className="w-10 h-10 rounded-full object-cover" />
                : <span className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">{(u.display_name ?? "U").slice(0,2).toUpperCase()}</span>}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{u.display_name}</p>
                <p className="text-xs text-muted-foreground">@{u.username} · {u.roles?.join(", ") || "user"}</p>
              </div>
              <button onClick={() => set.mutate({ userId: u.user_id, role: "admin", grant: !isAdmin })}
                className={`h-9 px-3 rounded-full text-xs font-bold inline-flex items-center gap-1 ${isAdmin ? "bg-secondary" : "community-btn text-white"}`}>
                {isAdmin ? <><ShieldOff size={13} /> Revoke admin</> : <><Shield size={13} /> Make admin</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
