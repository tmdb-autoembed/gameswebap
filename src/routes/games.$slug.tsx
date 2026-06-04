import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPostBySlug } from "@/lib/posts.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Download, Star } from "lucide-react";

export const Route = createFileRoute("/games/$slug")({
  component: PostDetail,
});

function PostDetail() {
  const { slug } = Route.useParams();
  const fn = useServerFn(getPostBySlug);
  const { data, isLoading } = useQuery({ queryKey: ["post", slug], queryFn: () => fn({ data: { slug } }) });
  const p = data?.post;

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-foreground">Loading…</div>;
  if (!p) return <div className="min-h-screen flex items-center justify-center text-foreground">Not found. <Link to="/" className="ml-2 text-primary">Home</Link></div>;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <div className="relative">
          {p.backdrop_url && (
            <div className="absolute inset-0 -z-10">
              <img src={p.backdrop_url} alt="" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
            </div>
          )}
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
            <nav className="text-xs text-muted-foreground mb-4">
              <Link to="/" className="hover:text-foreground">Home</Link> / <Link to="/games" className="hover:text-foreground capitalize">{p.kind}</Link> / <span className="text-foreground">{p.title}</span>
            </nav>
            <div className="grid md:grid-cols-[280px_1fr] gap-8">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border">
                {p.cover_url ? <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-fuchsia-500 to-purple-600" />}
              </div>
              <div>
                {p.subtitle && <p className="text-sm text-muted-foreground">{p.subtitle}</p>}
                <h1 className="font-display text-3xl md:text-5xl font-black my-2">{p.title}</h1>
                <div className="flex items-center gap-1 text-yellow-400 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} fill={i < Math.round(p.rating ?? 0) ? "currentColor" : "none"} />)}
                  <span className="text-sm text-muted-foreground ml-2">{p.reviews} reviews</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {p.genres?.map((g: string) => <span key={g} className="px-3 h-7 inline-flex items-center rounded-full bg-secondary text-xs">{g}</span>)}
                </div>
                <p className="text-foreground/80 mb-6 leading-relaxed">{p.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 text-sm">
                  {p.size && <Stat label="Size" value={p.size} />}
                  {p.year && <Stat label="Year" value={String(p.year)} />}
                  {p.developer && <Stat label="Developer" value={p.developer} />}
                  {p.publisher && <Stat label="Publisher" value={p.publisher} />}
                </div>
                {p.download_url && (
                  <a href={p.download_url} className="download-btn inline-flex items-center gap-2 h-12 px-6 rounded-full text-white font-bold">
                    <Download size={18} /> Download
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-card border border-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold truncate">{value}</p>
    </div>
  );
}
