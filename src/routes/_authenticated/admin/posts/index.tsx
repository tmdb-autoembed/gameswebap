import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListPosts, adminDeletePost } from "@/lib/posts.functions";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/posts/")({
  component: PostsList,
});

function PostsList() {
  const [q, setQ] = useState("");
  const listFn = useServerFn(adminListPosts);
  const delFn = useServerFn(adminDeletePost);
  const { data, refetch } = useQuery({ queryKey: ["admin-posts", q], queryFn: () => listFn({ data: { search: q, limit: 100 } }) });
  const del = useMutation({ mutationFn: (id: string) => delFn({ data: { id } }), onSuccess: () => refetch() });
  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2">
        <h1 className="text-3xl font-display font-black">Posts ({data?.total ?? 0})</h1>
        <Link to="/admin/posts/$id" params={{ id: "new" }} className="community-btn px-4 h-10 inline-flex items-center rounded-full text-white font-bold text-sm">+ New post</Link>
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full mb-4 h-10 px-4 rounded-lg bg-secondary border border-border" />
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase">
            <tr><th className="p-3">Title</th><th className="p-3">Kind</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {(data?.posts ?? []).map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 capitalize">{p.kind}</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3 text-right">
                  <Link to="/admin/posts/$id" params={{ id: p.id }} className="text-primary mr-3">Edit</Link>
                  <button onClick={() => { if (confirm("Delete?")) del.mutate(p.id); }} className="text-destructive">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
