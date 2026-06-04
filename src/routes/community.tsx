import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSettings } from "@/lib/menu.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "Community — Creative Conor" }] }),
  component: Community,
});

function Community() {
  const fn = useServerFn(getSettings);
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => fn({}) });
  const c = data?.settings?.community ?? {};
  const links = [
    { name: "Discord", url: c.discord, color: "from-indigo-500 to-purple-600" },
    { name: "Telegram", url: c.telegram, color: "from-sky-500 to-blue-600" },
    { name: "YouTube", url: c.youtube, color: "from-red-500 to-rose-600" },
  ].filter((l) => l.url);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-black mb-4">Join the community</h1>
        <p className="text-muted-foreground mb-10">Connect with fellow gamers — request games, share tips, get updates.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {links.map((l) => (
            <a key={l.name} href={l.url} target="_blank" rel="noreferrer" className={`bg-gradient-to-br ${l.color} text-white p-6 rounded-2xl font-bold text-lg shadow-lg`}>
              {l.name}
            </a>
          ))}
        </div>
        {links.length === 0 && <p className="text-muted-foreground">Community links not configured yet.</p>}
        <Link to="/" className="inline-block mt-10 text-primary">← Back home</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
