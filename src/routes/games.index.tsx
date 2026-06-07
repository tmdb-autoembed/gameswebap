import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { HardDrive, Search, SlidersHorizontal, Star, Tag } from "lucide-react";
import { listPublicPosts } from "@/lib/posts.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useState } from "react";

type Kind = "games" | "software" | "apps" | "console";
type Sort = "popular" | "newest" | "rating" | "title";

const tagsByKind: Record<Kind, string[]> = {
  games: ["Action", "Open World", "Adventure", "Racing", "Multiplayer", "Simulation", "Strategy", "Survival", "Sports", "Horror"],
  software: ["Windows", "Office", "Editing", "Plugin", "Utility", "Design", "Driver", "Linux", "Security", "Tools"],
  apps: ["Android", "Social", "Streaming", "Tools", "Music", "Photo", "Productivity", "Messaging"],
  console: ["PS4", "PS5", "Xbox", "Switch", "Action", "Adventure", "Sports", "Racing"],
};

export function ArchivePage({ kind, title }: { kind: Kind; title: string }) {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState<Sort>("popular");
  const [offset, setOffset] = useState(0);
  const fn = useServerFn(listPublicPosts);
  const { data, isLoading } = useQuery({
    queryKey: ["archive", kind, search, genre, sort, offset],
    queryFn: () => fn({ data: { kind, search, genre: genre || undefined, sort, limit: 25, offset } }),
  });
  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        <nav className="text-xs text-muted-foreground mb-4"><Link to="/">Home</Link> <span className="mx-1">›</span> {title}</nav>
        <section className="admin-hero-card min-h-0 mb-6">
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">{title}</p>
            <h1 className="mt-2 font-display text-3xl md:text-5xl font-black">{title} Library</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">Discover downloads with clean filters, compact category tags, and poster-only cards that reveal details on hover.</p>
          </div>
        </section>

        <section className="glass rounded-2xl p-4 mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <label className="relative flex-1">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0); }} placeholder={`Search ${title.toLowerCase()}…`} className="w-full h-11 pl-10 pr-3 rounded-xl bg-secondary/70 border border-border outline-none focus:border-primary" />
            </label>
            <label className="relative md:w-56">
              <SlidersHorizontal size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select value={sort} onChange={(e) => { setSort(e.target.value as Sort); setOffset(0); }} className="w-full h-11 pl-10 pr-3 rounded-xl bg-secondary/70 border border-border outline-none focus:border-primary">
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Rating</option>
                <option value="title">Alphabetical</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setGenre(""); setOffset(0); }} className={`genre-filter ${!genre ? "genre-filter-active" : ""}`}>All</button>
            {tagsByKind[kind].map((tag) => (
              <button key={tag} onClick={() => { setGenre(tag); setOffset(0); }} className={`genre-filter ${genre === tag ? "genre-filter-active" : ""}`}>{tag}</button>
            ))}
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{isLoading ? "Loading…" : `${total} items found`}</span>
          <span className="capitalize">{sort} sort</span>
        </div>

        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No posts found. Admin can add posts or import from sitemap.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-5">
            {posts.map((post: any) => <ArchiveCard key={post.id} post={post} />)}
          </div>
        )}

        <div className="mt-8 flex justify-center gap-2">
          <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 25))} className="px-4 h-10 rounded-full bg-secondary disabled:opacity-50">Prev</button>
          <span className="px-4 h-10 inline-flex items-center text-sm text-muted-foreground">{total ? offset + 1 : 0}–{Math.min(offset + 25, total)} of {total}</span>
          <button disabled={offset + 25 >= total} onClick={() => setOffset(offset + 25)} className="px-4 h-10 rounded-full bg-secondary disabled:opacity-50">Next</button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ArchiveCard({ post }: { post: any }) {
  const category = post.genres?.[0] ?? post.genres_text?.split(",")?.[0] ?? post.kind;
  return (
    <Link to="/games/$slug" params={{ slug: post.slug }} className="group block">
      <article className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] border border-transparent bg-card transition-all duration-300 group-hover:border-[var(--primary)] group-hover:shadow-[0_0_34px_rgba(var(--primary-rgb),0.32)]">
        {post.cover_url ? (
          <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:blur-sm" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 transition-all duration-300 group-hover:scale-105 group-hover:blur-sm" />
        )}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <h2 className="line-clamp-2 text-sm md:text-base font-black text-white">{post.title}</h2>
          <div className="mt-2 space-y-1.5 text-[11px] text-white/80">
            {post.version && <p className="flex items-center gap-1.5"><Tag size={12} /> {post.version}</p>}
            <p className="flex items-center gap-1.5"><Tag size={12} /> {category}</p>
            {(post.file_size || post.size) && <p className="flex items-center gap-1.5"><HardDrive size={12} /> {post.file_size ?? post.size}</p>}
            <p className="flex items-center gap-1.5 text-yellow-300"><Star size={12} className="fill-current" /> {post.rating ?? 0}/5</p>
          </div>
        </div>
      </article>
    </Link>
  );
}

export const Route = createFileRoute("/games/")({
  head: () => ({ meta: [{ title: "Games — Creative Conor" }, { name: "description", content: "All games archive" }] }),
  component: () => <ArchivePage kind="games" title="Games" />,
});
