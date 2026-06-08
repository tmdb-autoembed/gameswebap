import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListPosts, adminDeletePost } from "@/lib/posts.functions";
import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";

const KINDS = ["games", "software", "apps", "console"] as const;

export const Route = createFileRoute("/_authenticated/admin/posts/")({
  component: PostsList,
});

const kindHref: Record<string, string> = {
  games: "/games",
  software: "/software",
  apps: "/apps",
  console: "/console-games",
};

function PostsList() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<string>("all");
  const listFn = useServerFn(adminListPosts);
  const delFn = useServerFn(adminDeletePost);
  const { data, refetch } = useQuery({ queryKey: ["admin-posts", q, kind], queryFn: () => listFn({ data: { search: q, limit: 100 } }) });
  const del = useMutation({ mutationFn: (id: string) => delFn({ data: { id } }), onSuccess: () => refetch() });

  const posts = data?.posts ?? [];
  const filtered = kind === "all" ? posts : posts.filter((p: any) => p.kind === kind);
  const grouped = KINDS.map((k) => ({ kind: k, items: filtered.filter((p: any) => p.kind === k) })).filter((g) => g.items.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2">
        <h1 className="text-3xl font-display font-black">Posts ({data?.total ?? 0})</h1>
        <Link to="/admin/posts/$id" params={{ id: "new" }} className="community-btn px-4 h-10 inline-flex items-center rounded-full text-white font-bold text-sm">+ New post</Link>
      </div>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-10 px-4 rounded-lg bg-secondary border border-border" />
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-10 px-3 rounded-lg bg-secondary border border-border">
          <option value="all">All kinds</option>
          {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase">
            <tr><th className="p-3">Title</th><th className="p-3">Kind</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {grouped.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No posts found.</td></tr>
            )}
            {grouped.map((group) => (
              <>
                <tr key={group.kind} className="bg-white/[0.02]">
                  <td colSpan={4} className="px-3 py-1.5 text-xs uppercase tracking-wider text-primary font-bold">{group.kind}</td>
                </tr>
                {group.items.map((p: any) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3 font-medium">{p.title}</td>
                    <td className="p-3 capitalize">{p.kind}</td>
                    <td className="p-3">{p.status}</td>
                    <td className="p-3 text-right">
                      <Link to={kindHref[p.kind] ?? "/games"} params={{ slug: p.slug }} className="text-primary mr-3">View</Link>
                      <Link to="/admin/posts/$id" params={{ id: p.id }} className="text-foreground/70 mr-3">Edit</Link>
                      <button onClick={() => { if (confirm("Delete?")) del.mutate(p.id); }} className="text-destructive">Delete</button>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
