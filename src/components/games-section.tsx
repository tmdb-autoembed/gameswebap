import { useState } from "react";
import { GameCard } from "./game-card";
import { trending, recent } from "@/lib/games-data";

const tabs = ["Games", "Software", "Apps"];

export function GamesSection() {
  const [active, setActive] = useState("Games");
  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 mt-14">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-display text-2xl md:text-3xl font-black tracking-wide">Games</h2>
        <div className="flex items-center gap-1 p-1 rounded-full bg-secondary/60 border border-border/40">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-4 h-9 text-sm font-semibold rounded-full transition-all ${
                active === t
                  ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-md shadow-purple-500/30"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-foreground/70">
        <span className="w-1 h-4 bg-primary rounded-full" />
        TRENDING GAMES
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {trending.map((g) => <GameCard key={g.slug} game={g} />)}
      </div>

      <div className="mt-12 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-foreground/70">
        <span className="w-1 h-4 bg-primary rounded-full" />
        RECENT GAMES UPDATES
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {recent.map((g) => <GameCard key={g.slug} game={g} />)}
      </div>
    </section>
  );
}
