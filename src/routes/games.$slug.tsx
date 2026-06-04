import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { games } from "@/lib/games-data";
import { Download, Flag, Heart, ThumbsUp, ThumbsDown, Star, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/games/$slug")({
  loader: ({ params }) => {
    const game = games.find((g) => g.slug === params.slug);
    if (!game) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.game.title} — Creative Conor` },
      { name: "description", content: loaderData?.game.description },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">Game not found</div>
  ),
  errorComponent: () => (
    <div className="min-h-screen flex items-center justify-center">Something went wrong</div>
  ),
  component: GamePage,
});

const genreColors: Record<string, string> = {
  Action: "text-cyan-300 border-cyan-500/40 bg-cyan-500/10",
  "Open World": "text-purple-300 border-purple-500/40 bg-purple-500/10",
  Adventure: "text-blue-300 border-blue-500/40 bg-blue-500/10",
  Multiplayer: "text-violet-300 border-violet-500/40 bg-violet-500/10",
  Sandbox: "text-green-300 border-green-500/40 bg-green-500/10",
  Crime: "text-sky-300 border-sky-500/40 bg-sky-500/10",
  Racing: "text-cyan-300 border-cyan-500/40 bg-cyan-500/10",
  Simulation: "text-green-300 border-green-500/40 bg-green-500/10",
  Sports: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
  Driving: "text-yellow-300 border-yellow-500/40 bg-yellow-500/10",
  RPG: "text-pink-300 border-pink-500/40 bg-pink-500/10",
};

function GamePage() {
  const { game } = Route.useLoaderData();
  const related = games.filter((g) => g.slug !== game.slug).slice(0, 6);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {/* breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-foreground/60">
          <Link to="/">Home</Link>
          <ChevronRight size={12} />
          <span>Games</span>
          <ChevronRight size={12} />
          <span className="text-foreground">{game.title}</span>
        </div>

        {/* hero */}
        <div className="mt-6 grid md:grid-cols-[280px_1fr] gap-8">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 relative">
            <div className="absolute inset-0" style={{ background: game.cover }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <span className="font-display font-black text-white text-center text-2xl tracking-wider drop-shadow-lg">
                {game.title.toUpperCase()}
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm text-foreground/60">{game.title} (Co-Op) P2P</div>
            <h1 className="font-display text-3xl md:text-5xl font-black mt-1 leading-tight">{game.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-foreground/70">RATE & REVIEW</span>
              <span className="flex gap-0.5 text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < (game.rating ?? 0) ? "currentColor" : "transparent"} />
                ))}
              </span>
              <span className="text-foreground/70">{game.rating}.0/5 · {game.reviews} reviews</span>
              <span className="text-foreground/70">👍 100% recommend</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/70">
              <span>PC</span>
              <span>{game.size}</span>
              <span>{game.year}</span>
              <span>{game.developer}</span>
              <span>Published 3 months ago</span>
              <span>Version: v1.0</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold">v1.0.231.0</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1">● Latest</span>
              <button className="px-3 py-1 rounded-full bg-secondary text-xs font-medium flex items-center gap-1.5"><Heart size={12}/> Favorite</button>
              <button className="px-3 py-1 rounded-full bg-secondary text-xs font-medium flex items-center gap-1.5"><Flag size={12}/> Report</button>
              <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium flex items-center gap-1.5"><ThumbsUp size={12}/> 897</span>
              <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium flex items-center gap-1.5"><ThumbsDown size={12}/> 203</span>
            </div>

            <p className="mt-5 text-foreground/80">{game.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-foreground/60 mr-1">Genres ›</span>
              {game.genres?.map((g: string) => (
                <span key={g} className={`px-3 py-1 rounded-full border text-xs font-bold ${genreColors[g] ?? "text-foreground/80 border-border bg-secondary"}`}>
                  {g}
                </span>
              ))}
            </div>

            <button className="download-btn mt-6 inline-flex items-center gap-2 px-6 h-12 rounded-full text-white font-bold">
              <Download size={18} /> Download
            </button>
          </div>
        </div>

        {/* description card */}
        <div className="mt-12 rounded-3xl bg-card/60 border border-border/40 p-6 md:p-8 backdrop-blur-sm">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">📋 Description</h2>
          <div className="mt-4 space-y-4 text-foreground/80 leading-relaxed text-sm">
            <p><strong className="text-foreground">{game.title}</strong> is an iconic title developed by {game.developer}. {game.description}</p>
            <p>Players engage in a vast array of activities, each providing a lifelike experience that makes exploration rewarding. The game continues to receive updates, ensuring that players always have new content to explore.</p>
            <p>The graphics are nothing short of breathtaking. The game utilizes advanced rendering techniques to create a stunning visual experience, complete with realistic weather effects and dynamic day-night cycles.</p>
          </div>
        </div>

        {/* install + sysreq */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-card/60 border border-border/40 p-6">
            <h3 className="font-bold flex items-center gap-2">📦 Installation Guide</h3>
            <p className="text-xs text-foreground/60">Step-by-step setup process</p>
            <ol className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3"><span className="w-6 h-6 shrink-0 rounded-full border border-primary/50 text-primary text-xs flex items-center justify-center">1</span> Game is pre-installed / portable.</li>
              <li className="flex gap-3"><span className="w-6 h-6 shrink-0 rounded-full border border-primary/50 text-primary text-xs flex items-center justify-center">2</span> Just extract the rar / zip file.</li>
              <li className="flex gap-3"><span className="w-6 h-6 shrink-0 rounded-full border border-primary/50 text-primary text-xs flex items-center justify-center">3</span> Simply launch the game Run Me!.bat</li>
            </ol>
            <div className="mt-5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4 text-xs text-foreground/80">
              <div className="font-bold text-yellow-300 mb-2">⚠ Important Notes</div>
              <ul className="space-y-1 list-disc list-inside text-foreground/70">
                <li>Install necessary apps from Redist or _CommonRedist</li>
                <li>Always extract game in Antivirus / Defender excluded folder</li>
                <li>Always run the game as administrator</li>
              </ul>
            </div>
          </div>
          <div className="rounded-3xl bg-card/60 border border-border/40 p-6">
            <h3 className="font-bold flex items-center gap-2">💻 System Requirements</h3>
            <p className="text-xs text-foreground/60">Minimum specifications needed</p>
            <div className="mt-4 text-center text-[10px] tracking-widest text-foreground/60 font-bold">REQUIRES A 64-BIT PROCESSOR AND OS</div>
            <dl className="mt-3 divide-y divide-border/40 text-sm">
              {[
                ["OS", "Windows 7 SP1, Windows 8, Windows 10"],
                ["Processor", "Intel Core i5-2500K or AMD FX-8120"],
                ["RAM", game.size ?? "8 GB"],
                ["Graphics", "NVIDIA GTX 460 / AMD HD 6870"],
                ["DirectX", "Version 11"],
                ["Storage", "15 GB available space"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2">
                  <dt className="text-foreground/60">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* download big */}
        <div className="mt-8 flex justify-center">
          <button className="inline-flex items-center gap-2 px-8 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold shadow-lg shadow-emerald-500/30">
            <Download size={18} /> Download Now
          </button>
        </div>

        {/* related */}
        <div className="mt-14">
          <h3 className="font-bold mb-4 flex items-center gap-2">🔗 Related</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {related.map((r) => (
              <Link key={r.slug} to="/games/$slug" params={{ slug: r.slug }} className="aspect-[3/4] rounded-xl overflow-hidden relative">
                <div className="absolute inset-0" style={{ background: r.cover }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <span className="font-display font-black text-white text-center text-sm tracking-wide drop-shadow">{r.title.toUpperCase()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
