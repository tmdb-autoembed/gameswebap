import { Link } from "@tanstack/react-router";
import type { Game } from "@/lib/games-data";

export function GameCard({ game }: { game: Game }) {
  return (
    <Link
      to="/games/$slug"
      params={{ slug: game.slug }}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg shadow-black/40 transition-transform hover:-translate-y-1 hover:shadow-purple-500/30"
    >
      <div className="absolute inset-0" style={{ background: game.cover }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90" />
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <span className="font-display font-black text-white text-center text-lg md:text-xl tracking-wider drop-shadow-lg leading-tight">
          {game.title.toUpperCase()}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
        <div className="text-[10px] text-white/70 uppercase tracking-wider">{game.year} · {game.developer}</div>
      </div>
    </Link>
  );
}
