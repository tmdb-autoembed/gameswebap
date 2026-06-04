import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: () => (
    <div>
      <h1 className="text-3xl font-display font-black mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/admin/posts" className="p-5 rounded-xl bg-card border border-border hover:border-primary">
          <p className="font-bold text-lg">Posts</p>
          <p className="text-sm text-muted-foreground">Manage games, software, apps</p>
        </Link>
        <Link to="/admin/import" className="p-5 rounded-xl bg-card border border-border hover:border-primary">
          <p className="font-bold text-lg">Import from sitemap</p>
          <p className="text-sm text-muted-foreground">Bulk scrape posts via Firecrawl</p>
        </Link>
        <Link to="/admin/menu" className="p-5 rounded-xl bg-card border border-border hover:border-primary">
          <p className="font-bold text-lg">Menu</p>
          <p className="text-sm text-muted-foreground">Header navigation items</p>
        </Link>
      </div>
    </div>
  ),
});
