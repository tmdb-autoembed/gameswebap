import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyRole } from "@/lib/menu.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const roleFn = useServerFn(getMyRole);
  const { data, isLoading } = useQuery({ queryKey: ["my-role"], queryFn: () => roleFn({}) });

  if (isLoading) return <div className="p-8 text-foreground">Loading admin…</div>;
  if (!data?.isAdmin) return <div className="p-8 text-foreground">403 — Admin access required.</div>;

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-card border-r border-border p-4 hidden md:block">
        <p className="font-display font-black text-lg logo-gradient mb-6">ADMIN</p>
        <nav className="flex flex-col gap-1 text-sm">
          <Link to="/admin" activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Dashboard</Link>
          <Link to="/admin/posts" activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Games / Posts</Link>
          <Link to="/admin/categories" activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Categories</Link>
          <Link to="/admin/menu" activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Menu</Link>
          <Link to="/admin/pages" activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Pages / Blog</Link>
          <Link to="/admin/community" activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Community</Link>
          <Link to="/admin/comments" activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Comments</Link>
          <Link to="/admin/reviews" activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Reviews</Link>
          <Link to="/admin/requests" activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Game Requests</Link>
          <Link to="/admin/reports" activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Reports</Link>
          <Link to="/admin/users" activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Users</Link>
          <Link to="/admin/assets" activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Media Library</Link>
          <Link to="/admin/import" activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Importer</Link>
          <Link to="/admin/settings" activeProps={{ className: "bg-secondary" }} className="px-3 py-2 rounded-lg hover:bg-secondary">Settings</Link>
        </nav>

        <button
          onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
          className="mt-6 w-full px-3 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground"
        >Sign out</button>
      </aside>
      <main className="flex-1 p-6 max-w-6xl"><Outlet /></main>
    </div>
  );
}
