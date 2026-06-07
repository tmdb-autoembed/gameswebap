import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download, ChevronRight, Star } from "lucide-react";
import { heroSlides } from "@/lib/games-data";

export function HeroSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = heroSlides[i];
  return (
    <section className="relative hidden md:block">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-6">
        <div className="relative rounded-3xl overflow-hidden h-[420px] md:h-[520px] shadow-2xl shadow-purple-950/40">
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{ background: slide.image }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

          <div key={slide.game.slug} className="relative h-full flex flex-col justify-end md:justify-center p-6 md:p-12 max-w-xl">
            <span className="fade-up-item inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold tracking-wider">
              <Star size={12} fill="currentColor" /> FEATURED
            </span>
            <h1 className="fade-up-item [animation-delay:90ms] font-display font-black text-4xl md:text-6xl mt-4 leading-tight tracking-wide drop-shadow-[0_0_20px_rgba(0,0,0,0.6)]">
              {slide.game.title.toUpperCase()}
            </h1>
            <p className="fade-up-item [animation-delay:180ms] mt-4 text-sm md:text-base text-foreground/80 max-w-md line-clamp-3">
              {slide.game.description}
            </p>
            <div className="fade-up-item [animation-delay:270ms] flex gap-3 mt-6">
              <Link
                to="/games/$slug"
                params={{ slug: slide.game.slug }}
                className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/40"
              >
                Download Now <Download size={16} />
              </Link>
              <Link
                to="/games/$slug"
                params={{ slug: slide.game.slug }}
                className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold backdrop-blur-sm hover:bg-white/20"
              >
                Details <ChevronRight size={16} />
              </Link>
            </div>
            <div className="mt-6 h-1 w-40 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-sky-400 transition-all duration-100" style={{ width: `${((i + 1) / heroSlides.length) * 100}%` }} />
            </div>
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`h-2 rounded-full transition-all ${idx === i ? "bg-sky-400 w-8" : "bg-white/30 w-2"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
