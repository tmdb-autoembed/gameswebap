import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { globalSearch } from "@/lib/community.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const fn = useServerFn(globalSearch);
  const { data } = useQuery({
    queryKey: ["gs", q],
    queryFn: () => fn({ data: { q } }),
    enabled: q.length >= 2,
  });
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="relative">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search games, posts, people..." className="w-full h-12 pl-12 pr-4 rounded-full bg-secondary outline-none" />
        </div>
        {q.length >= 2 && (
          <>
            <Section title="Games">
              {(data?.games ?? []).map((g: any) => (
                <Link key={g.slug} to="/games/$slug" params={{ slug: g.slug }} className="flex items-center gap-3 p-2 rounded-xl glass hover:glow-purple">
                  {g.cover_url ? <img src={g.cover_url} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-gradient-to-br from-fuchsia-500 to-purple-600" />}
                  <span><span className="font-semibold block">{g.title}</span><span className="text-xs text-muted-foreground capitalize">{g.kind}</span></span>
                </Link>
              ))}
            </Section>
            <Section title="People">
              {(data?.people ?? []).map((p: any) => (
                <Link key={p.user_id} to="/profile/$username" params={{ username: p.username }} className="flex items-center gap-3 p-2 rounded-xl glass">
                  {p.avatar ? <img src={p.avatar} className="w-10 h-10 rounded-full object-cover" /> : <span className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{(p.display_name ?? "U").slice(0,2).toUpperCase()}</span>}
                  <span><span className="font-semibold block">{p.display_name}</span><span className="text-xs text-muted-foreground">@{p.username}</span></span>
                </Link>
              ))}
            </Section>
            <Section title="Community posts">
              {(data?.posts ?? []).map((p: any) => (
                <Link key={p.id} to="/community/$postId" params={{ postId: p.id }} className="block p-3 rounded-xl glass">
                  {p.title && <p className="font-semibold">{p.title}</p>}
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.content}</p>
                </Link>
              ))}
            </Section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: any) {
  const c = (children ?? []).filter ? children.filter((x: any) => x) : children;
  if (!c || (Array.isArray(c) && c.length === 0)) return null;
  return (
    <section>
      <h2 className="font-display font-bold text-lg mb-2">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
