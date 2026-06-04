import { Link } from "@tanstack/react-router";
import { Search, Sun, Menu, Users, Gamepad2 } from "lucide-react";
import { useState } from "react";

const nav = [
  { label: "Games", to: "/" },
  { label: "Top", to: "/" },
  { label: "Trending", to: "/" },
  { label: "Software", to: "/" },
  { label: "Apps", to: "/" },
  { label: "Console Games", to: "/" },
  { label: "Donate", to: "/" },
  { label: "Request", to: "/" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setOpen(!open)} className="lg:hidden text-foreground/80">
            <Menu size={22} />
          </button>
          <Link to="/" className="font-display font-black text-xl lg:text-2xl tracking-wider logo-gradient">
            CREATIVE CONOR
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-foreground/80">
          {nav.map((n) => (
            <Link key={n.label} to={n.to} className="hover:text-foreground transition-colors whitespace-nowrap">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:gap-3">
          <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-purple-500/30">
            <Gamepad2 size={18} />
          </button>
          <button className="community-btn hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-full text-white text-sm font-bold tracking-wide">
            <Users size={16} /> COMMUNITY
          </button>
          <button className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-foreground/80 hover:text-foreground">
            <Search size={18} />
          </button>
          <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground/80">
            <Sun size={18} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-border/40 px-4 py-3 flex flex-col gap-2 bg-background/95">
          {nav.map((n) => (
            <Link key={n.label} to={n.to} onClick={() => setOpen(false)} className="py-2 text-sm text-foreground/80">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
