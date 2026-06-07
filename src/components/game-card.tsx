import { Link } from "@tanstack/react-router";
import { HardDrive, Star, Tag } from "lucide-react";
import type { Game } from "@/lib/games-data";

export function GameCard({ game }: { game: Game }) {
  return (
    <Link to="/games/$slug" params={{ slug: game.slug }} className="group block">
      <article className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] border border-transparent bg-card transition-all duration-300 group-hover:border-[var(--primary)] group-hover:shadow-[0_0_34px_rgba(var(--primary-rgb),0.32)]">
        <div className="absolute inset-0 transition-all duration-300 group-hover:scale-105 group-hover:blur-sm" style={{ background: game.cover }} />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <h2 className="line-clamp-2 text-sm md:text-base font-black text-white">{game.title}</h2>
          <div className="mt-2 space-y-1.5 text-[11px] text-white/80">
            <p className="flex items-center gap-1.5"><Tag size={12} /> {game.year}</p>
            <p className="flex items-center gap-1.5"><Tag size={12} /> {game.developer}</p>
            <p className="flex items-center gap-1.5"><HardDrive size={12} /> Download</p>
            <p className="flex items-center gap-1.5 text-yellow-300"><Star size={12} className="fill-current" /> Featured</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
