import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createCommunityPost } from "@/lib/community.functions";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Image as ImageIcon, BarChart3, Smile, MapPin, X, Link as LinkIcon, Loader2, MessageSquare, AlertCircle, Trophy, Send } from "lucide-react";

type T = "discussion" | "issue" | "showcase";

export function PostComposer({ onPosted }: { onPosted?: () => void }) {
  const qc = useQueryClient();
  const fn = useServerFn(createCommunityPost);
  const { upload, busy } = useImageUpload();

  const [type, setType] = useState<T>("discussion");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [linkDraft, setLinkDraft] = useState("");
  const [feeling, setFeeling] = useState("");
  const [location, setLocation] = useState("");
  const [showPoll, setShowPoll] = useState(false);
  const [pollQ, setPollQ] = useState("");
  const [pollOpts, setPollOpts] = useState(["", ""]);

  const create = useMutation({
    mutationFn: () => fn({ data: {
      type, content, images, links,
      feeling: feeling || undefined,
      location: location || undefined,
      poll: showPoll && pollQ && pollOpts.filter(Boolean).length >= 2 ? { question: pollQ, options: pollOpts.filter(Boolean) } : undefined,
    } }),
    onSuccess: () => {
      setContent(""); setImages([]); setLinks([]); setLinkDraft(""); setFeeling(""); setLocation("");
      setShowPoll(false); setPollQ(""); setPollOpts(["", ""]);
      qc.invalidateQueries({ queryKey: ["feed"] });
      onPosted?.();
    },
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files).slice(0, 4 - images.length)) {
      try {
        const url = await upload(f);
        setImages((p) => [...p, url]);
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-4 space-y-3">
      <div className="flex gap-1.5 p-1 rounded-full glass w-fit">
        {([
          { k: "discussion", L: MessageSquare, c: "from-fuchsia-500 to-purple-600" },
          { k: "issue", L: AlertCircle, c: "from-amber-400 to-rose-500" },
          { k: "showcase", L: Trophy, c: "from-emerald-400 to-cyan-500" },
        ] as const).map(({ k, L, c }) => (
          <button key={k} onClick={() => setType(k)}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-bold uppercase tracking-wider transition ${type === k ? `bg-gradient-to-r ${c} text-white` : "text-foreground/70"}`}>
            <L size={13} /> {k}
          </button>
        ))}
      </div>

      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3}
        placeholder={type === "issue" ? "Describe the issue..." : type === "showcase" ? "Share your achievement..." : "What's on your mind?"}
        className="w-full bg-transparent outline-none resize-none text-foreground placeholder:text-muted-foreground text-[15px]" />

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative aspect-video rounded-lg overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute top-1 right-1 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {links.length > 0 && (
        <div className="space-y-1">
          {links.map((l) => (
            <div key={l} className="flex items-center gap-2 text-sm p-2 rounded-lg glass">
              <LinkIcon size={14} className="text-brand-cyan" />
              <span className="truncate flex-1">{l}</span>
              <button onClick={() => setLinks(links.filter((x) => x !== l))} className="text-muted-foreground"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {(feeling || location) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {feeling && <span className="px-2 py-1 rounded-full glass flex items-center gap-1"><Smile size={12} /> feeling {feeling} <button onClick={() => setFeeling("")} className="ml-1"><X size={10} /></button></span>}
          {location && <span className="px-2 py-1 rounded-full glass flex items-center gap-1"><MapPin size={12} /> at {location} <button onClick={() => setLocation("")} className="ml-1"><X size={10} /></button></span>}
        </div>
      )}

      {showPoll && (
        <div className="p-3 rounded-xl glass space-y-2">
          <input value={pollQ} onChange={(e) => setPollQ(e.target.value)} placeholder="Poll question" className="w-full h-9 px-3 rounded-lg bg-secondary/60 text-sm outline-none" />
          {pollOpts.map((o, i) => (
            <input key={i} value={o} onChange={(e) => setPollOpts(pollOpts.map((x, j) => j === i ? e.target.value : x))}
              placeholder={`Option ${i + 1}`} className="w-full h-9 px-3 rounded-lg bg-secondary/60 text-sm outline-none" />
          ))}
          <div className="flex justify-between">
            <button onClick={() => setPollOpts([...pollOpts, ""])} disabled={pollOpts.length >= 6} className="text-xs text-primary">+ Add option</button>
            <button onClick={() => setShowPoll(false)} className="text-xs text-muted-foreground">Remove poll</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40">
        <label className="h-9 px-3 rounded-full hover:bg-secondary text-foreground/80 flex items-center gap-1.5 text-sm cursor-pointer">
          <ImageIcon size={16} className="text-brand-lime" /> Photo
          <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
        </label>
        <button onClick={() => setShowPoll(true)} disabled={showPoll} className="h-9 px-3 rounded-full hover:bg-secondary text-sm flex items-center gap-1.5 disabled:opacity-50">
          <BarChart3 size={16} className="text-brand-cyan" /> Poll
        </button>
        <PromptButton icon={Smile} color="text-brand-amber" label="Feeling" value={feeling} setValue={setFeeling} placeholder="happy" />
        <PromptButton icon={MapPin} color="text-brand-pink" label="Location" value={location} setValue={setLocation} placeholder="Mumbai, IN" />
        <LinkInput value={linkDraft} setValue={setLinkDraft} onAdd={() => { try { new URL(linkDraft); setLinks([...links, linkDraft]); setLinkDraft(""); } catch {} }} />
        {busy && <Loader2 size={16} className="animate-spin text-primary" />}
        <button onClick={() => create.mutate()} disabled={!content.trim() || create.isPending}
          className="ml-auto community-btn flex items-center gap-2 px-5 h-9 rounded-full text-white font-bold text-sm disabled:opacity-50">
          <Send size={14} /> Post
        </button>
      </div>
    </div>
  );
}

function PromptButton({ icon: Icon, color, label, value, setValue, placeholder }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="h-9 px-3 rounded-full hover:bg-secondary text-sm flex items-center gap-1.5">
        <Icon size={16} className={color} /> {label}
      </button>
      {open && (
        <div className="absolute z-10 top-10 left-0 glass-strong rounded-xl p-2 flex gap-1">
          <input autoFocus placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} className="h-8 px-2 text-sm rounded-md bg-secondary outline-none w-40" />
          <button onClick={() => setOpen(false)} className="px-2 h-8 text-xs rounded-md bg-primary text-primary-foreground">OK</button>
        </div>
      )}
    </div>
  );
}

function LinkInput({ value, setValue, onAdd }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="h-9 px-3 rounded-full hover:bg-secondary text-sm flex items-center gap-1.5">
        <LinkIcon size={16} className="text-brand-blue" /> Link
      </button>
      {open && (
        <div className="absolute z-10 top-10 left-0 glass-strong rounded-xl p-2 flex gap-1">
          <input autoFocus placeholder="https://..." value={value} onChange={(e) => setValue(e.target.value)} className="h-8 px-2 text-sm rounded-md bg-secondary outline-none w-56" />
          <button onClick={() => { onAdd(); setOpen(false); }} className="px-2 h-8 text-xs rounded-md bg-primary text-primary-foreground">Add</button>
        </div>
      )}
    </div>
  );
}
