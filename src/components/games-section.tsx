import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicPosts } from "@/lib/posts.functions";
import { useState } from "react";

const tabs: { label: string; kind: "games" | "software" | "apps" }[] = [
  { label: "Games", kind: "games" },
  { label: "Software", kind: "software" },
  { label: "Apps", kind: "apps" },
];

export function GamesSection() {
  const [active, setActive] = useState<"games" | "software" | "apps">("games");
  const fn = useServerFn(listPublicPosts);
  const trending = useQuery({
    queryKey: ["home-trending", active],
    queryFn: () => fn({ data: { kind: active, sort: "rating", limit: 12 } }),
  });
  const recent = useQuery({
    queryKey: ["home-recent", active],
    queryFn: () => fn({ data: { kind: active, sort: "newest", limit: 12 } }),
  });

  const Row = ({ label, items }: any) => (
    <>
      <div className="mt-8 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-foreground/70">
        <span className="w-1 h-4 bg-primary rounded-full" />
        {label}
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {items.length === 0 && <p className="col-span-full text-sm text-muted-foreground">No posts yet. Admin: import from sitemap or add manually.</p>}
        {items.map((p: any) => (
          <Link key={p.id} to="/games/$slug" params={{ slug: p.slug }} className="group">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border">
              {p.cover_url ? (
                <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-fuchsia-500 to-purple-600" />
              )}
            </div>
            <p className="mt-2 text-sm font-semibold truncate">{p.title}</p>
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 mt-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-display text-2xl md:text-3xl font-black tracking-wide capitalize">{active}</h2>
        <div className="flex items-center gap-1 p-1 rounded-full bg-secondary/60 border border-border/40">
          {tabs.map((t) => (
            <button key={t.kind} onClick={() => setActive(t.kind)}
              className={`px-4 h-9 text-sm font-semibold rounded-full transition-all ${active === t.kind ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-md" : "text-foreground/70"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <Row label="TRENDING" items={trending.data?.posts ?? []} />
      <Row label="RECENT UPDATES" items={recent.data?.posts ?? []} />
    </section>
  );
}
