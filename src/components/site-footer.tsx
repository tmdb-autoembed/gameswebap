import { Link } from "@tanstack/react-router";
import { Bell, Home, Plus, Search, Tv, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function SiteFooter() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setAuthed(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <footer className="mt-20 border-t border-border/40 bg-background/60">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="font-display font-black text-xl logo-gradient">CREATIVE CONOR</div>
          <p className="mt-3 text-sm text-foreground/60 max-w-xs">
            Your ultimate destination for free game, software, and app downloads. Fast, secure, and always up to date.
          </p>
          <div className="mt-5 text-xs font-bold tracking-wider text-foreground/70">JOIN OUR COMMUNITY:</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Discord","YouTube","Instagram","TikTok"].map((s) => (
              <span key={s} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium">{s}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-3">Categories</h4>
          <ul className="space-y-2 text-sm text-foreground/60">
            <li><Link to="/">Games</Link></li>
            <li><Link to="/">Software</Link></li>
            <li><Link to="/">Apps</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-foreground/60">
            <li><Link to="/">Request</Link></li>
            <li><Link to="/">Random</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">About</h4>
          <ul className="space-y-2 text-sm text-foreground/60">
            <li><Link to="/">About Us</Link></li>
            <li><Link to="/">Privacy Policy</Link></li>
            <li><Link to="/">Terms of Service</Link></li>
            <li><Link to="/">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-5 text-center text-xs text-foreground/50">
        © 2026 CreativeConor. All rights reserved.
      </div>

         <nav className="mmenu md:hidden fixed left-2 right-2 bottom-10 z-[70] h-16 rounded-[1.4rem] border border-white/10 bg-background/90 backdrop-blur-2xl shadow-[0_18px_60px_-32px_rgba(0,0,0,0.9)] flex items-center justify-around">
        <Link to="/" className="mobile-dock-active" aria-label="Home"><Home size={24} /></Link>
        <Link to="/games" className="mobile-dock-item" aria-label="Games"><Tv size={22} /></Link>
        <Link to="/request-game" className="mobile-dock-create" aria-label="Request game"><Plus size={24} /></Link>
        <Link to="/search" className="mobile-dock-item" aria-label="Search"><Search size={22} /></Link>
        {authed ? (
          <Link to="/messages" className="mobile-dock-item" aria-label="Messages"><Bell size={20} /></Link>
        ) : (
          <Link to="/auth" className="mobile-dock-item" aria-label="Sign in"><User size={20} /></Link>
        )}
      </nav>

   
    </footer>
  );
}
