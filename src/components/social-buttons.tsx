const items = [
  { label: "Discord", sub: "Join Us", color: "var(--discord)", icon: "💬" },
  { label: "YouTube", sub: "Subscribe", color: "var(--youtube)", icon: "▶" },
  { label: "Instagram", sub: "Follow", color: "var(--instagram)", icon: "📷" },
  { label: "Tiktok", sub: "Follow", color: "var(--tiktok)", icon: "🎵" },
  { label: "Console", sub: "Game", color: "var(--console)", icon: "🎮" },
];

export function SocialButtons() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 mt-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((it) => (
          <button
            key={it.label}
            className="flex items-center gap-3 px-4 h-14 rounded-2xl text-white font-bold shadow-lg transition-transform hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${it.color}, color-mix(in oklab, ${it.color} 70%, black))` }}
          >
            <span className="text-xl">{it.icon}</span>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[10px] font-normal opacity-80">{it.sub}</span>
              <span className="text-sm">{it.label}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
