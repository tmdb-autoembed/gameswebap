import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicPosts } from "@/lib/posts.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useState } from "react";

type Kind = "games" | "software" | "apps" | "console";

export function ArchivePage({ kind, title }: { kind: Kind; title: string }) {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [sort, setSort] = useState<"newest" | "rating" | "title">("newest");
  const [offset, setOffset] = useState(0);
  const fn = useServerFn(listPublicPosts);
  const { data } = useQuery({
    queryKey: ["archive", kind, search, genre, year, sort, offset],
    queryFn: () => fn({ data: { kind, search, genre: genre || undefined, year: year || undefined, sort, limit: 24, offset } }),
  });
  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        <h1 className="font-display text-3xl md:text-4xl font-black mb-4">{title}</h1>
        <div className="flex flex-wrap gap-2 mb-6">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0); }} placeholder="Search title…" className="flex-1 min-w-48 h-10 px-3 rounded-full bg-secondary border border-border" />
          <input value={genre} onChange={(e) => { setGenre(e.target.value); setOffset(0); }} placeholder="Genre" className="h-10 px-3 rounded-full bg-secondary border border-border w-32" />
          <input type="number" value={year} onChange={(e) => { setYear(e.target.value ? parseInt(e.target.value) : ""); setOffset(0); }} placeholder="Year" className="h-10 px-3 rounded-full bg-secondary border border-border w-24" />
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-10 px-3 rounded-full bg-secondary border border-border">
            <option value="newest">Newest</option>
            <option value="rating">Top rated</option>
            <option value="title">A–Z</option>
          </select>
        </div>

        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No posts found. Admin can add posts or import from sitemap.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {posts.map((p: any) => (
              <Link key={p.id} to="/games/$slug" params={{ slug: p.slug }} className="group">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border relative">
                  {p.cover_url ? (
                    <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-fuchsia-500 to-purple-600" />
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold truncate">{p.title}</p>
                {p.year && <p className="text-xs text-muted-foreground">{p.year}</p>}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center gap-2">
          <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 24))} className="px-4 h-10 rounded-full bg-secondary disabled:opacity-50">Prev</button>
          <span className="px-4 h-10 inline-flex items-center text-sm text-muted-foreground">{offset + 1}–{Math.min(offset + 24, total)} of {total}</span>
          <button disabled={offset + 24 >= total} onClick={() => setOffset(offset + 24)} className="px-4 h-10 rounded-full bg-secondary disabled:opacity-50">Next</button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export const Route = createFileRoute("/games/")({
  head: () => ({ meta: [{ title: "Games — Creative Conor" }, { name: "description", content: "All games archive" }] }),
  component: () => <ArchivePage kind="games" title="Games" />,
});
