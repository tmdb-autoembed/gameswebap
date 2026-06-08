import { MessageCircle, PlayCircle, Camera, Music, Gamepad2 } from "lucide-react";

const items = [
  { label: "Discord", sub: "Join Us", color: "var(--discord)", icon: MessageCircle },
  { label: "YouTube", sub: "Subscribe", color: "var(--youtube)", icon: PlayCircle },
  { label: "Instagram", sub: "Follow", color: "var(--instagram)", icon: Camera },
  { label: "Tiktok", sub: "Follow", color: "var(--tiktok)", icon: Music },
  { label: "Console", sub: "Game", color: "var(--console)", icon: Gamepad2 },
];

export function SocialButtons() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 mt-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.label}
              className="group relative flex items-center gap-3 px-4 h-14 rounded-2xl text-white font-bold transition-transform hover:-translate-y-1"
              style={{
                background: it.color,
                boxShadow: `0 0 28px ${it.color}33`,
                border: `1px solid ${it.color}`,
              }}
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-white shadow-inner"
                style={{ boxShadow: `inset 0 0 0 1px ${it.color}` }}
              >
                <Icon size={18} />
              </span>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] font-normal opacity-80">{it.sub}</span>
                <span className="text-sm">{it.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
