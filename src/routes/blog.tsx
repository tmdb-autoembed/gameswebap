import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicPages } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [{ title: "Blog & Pages" }] }),
  component: BlogIndex,
});

function BlogIndex() {
  const fn = useServerFn(listPublicPages);
  const { data } = useQuery({ queryKey: ["pages"], queryFn: () => fn({}) });
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl md:text-4xl font-black flex items-center gap-2 mb-6"><BookOpen className="text-primary" /> Blog</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.pages ?? []).map((p: any) => (
            <Link key={p.slug} to="/page/$slug" params={{ slug: p.slug }} className="glass-strong rounded-2xl overflow-hidden hover:glow-purple transition">
              {p.cover_image
                ? <img src={p.cover_image} className="w-full h-44 object-cover" />
                : <div className="w-full h-44 gradient-purple-pink" />}
              <div className="p-4">
                <p className="font-bold">{p.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(p.updated_at).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
          {(data?.pages ?? []).length === 0 && <p className="text-muted-foreground">No posts yet</p>}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
