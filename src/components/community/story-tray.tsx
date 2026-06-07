import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listStories, createStory } from "@/lib/community.functions";
import { Plus, X, Image as ImageIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useImageUpload } from "@/hooks/use-image-upload";

export function StoryTray({ authed }: { authed: boolean }) {
  const fn = useServerFn(listStories);
  const { data } = useQuery({ queryKey: ["stories"], queryFn: () => fn({}) });
  const [composeOpen, setComposeOpen] = useState(false);
  const [viewIdx, setViewIdx] = useState<number | null>(null);
  const groups = data?.groups ?? [];

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin -mx-4 px-4">
        {authed && (
          <button onClick={() => setComposeOpen(true)} className="flex-shrink-0 w-24 text-center">
            <span className="relative block w-20 h-20 mx-auto rounded-full p-[3px] story-ring anim-pulse-glow">
              <span className="block w-full h-full rounded-full bg-card flex items-center justify-center">
                <Plus size={26} className="text-primary" />
              </span>
            </span>
            <span className="block text-xs mt-1.5 font-semibold">Your story</span>
          </button>
        )}
        {groups.map((g: any, i: number) => (
          <button key={i} onClick={() => setViewIdx(i)} className="flex-shrink-0 w-24 text-center">
            <span className="relative block w-20 h-20 mx-auto rounded-full p-[3px] story-ring">
              {g.author?.avatar ? (
                <img src={g.author.avatar} alt="" className="w-full h-full rounded-full object-cover border-2 border-background" />
              ) : (
                <span className="block w-full h-full rounded-full bg-card flex items-center justify-center font-bold border-2 border-background">
                  {(g.author?.display_name ?? "?").slice(0, 2).toUpperCase()}
                </span>
              )}
            </span>
            <span className="block text-xs mt-1.5 truncate">{g.author?.display_name ?? "User"}</span>
          </button>
        ))}
      </div>

      {composeOpen && <StoryComposer onClose={() => setComposeOpen(false)} />}
      {viewIdx !== null && <StoryViewer groups={groups} startIdx={viewIdx} onClose={() => setViewIdx(null)} />}
    </>
  );
}

function StoryComposer({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const fn = useServerFn(createStory);
  const { upload, busy } = useImageUpload();
  const [text, setText] = useState("");
  const [img, setImg] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => fn({ data: { text: text || null, image_url: img } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stories"] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-strong rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="font-display font-black">Create story</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="p-4 space-y-3">
          {img ? (
            <div className="relative aspect-[9/16] max-h-80 mx-auto rounded-xl overflow-hidden">
              <img src={img} className="w-full h-full object-cover" />
              <button onClick={() => setImg(null)} className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center"><X size={16} /></button>
            </div>
          ) : (
            <label className="block aspect-[9/16] max-h-80 mx-auto rounded-xl gradient-purple-pink flex items-center justify-center cursor-pointer">
              <input type="file" accept="image/*" hidden onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                try { setImg(await upload(f, "stories")); } catch (err) { console.error(err); }
              }} />
              {busy ? <Loader2 className="animate-spin text-white" /> : <span className="flex flex-col items-center text-white"><ImageIcon size={28} /> <span className="text-sm mt-2 font-bold">Add photo</span></span>}
            </label>
          )}
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a caption..." className="w-full h-10 px-3 rounded-full bg-secondary outline-none" />
          <button onClick={() => save.mutate()} disabled={(!img && !text) || save.isPending}
            className="w-full community-btn h-11 rounded-full text-white font-bold disabled:opacity-50">Share story</button>
        </div>
      </div>
    </div>
  );
}

function StoryViewer({ groups, startIdx, onClose }: any) {
  const [g, setG] = useState(startIdx);
  const [i, setI] = useState(0);
  const group = groups[g];
  const item = group?.items?.[i];
  useEffect(() => { setI(0); }, [g]);
  useEffect(() => {
    if (!item) return;
    const t = setTimeout(() => next(), 5000);
    return () => clearTimeout(t);
  });
  const next = () => {
    if (i + 1 < group.items.length) setI(i + 1);
    else if (g + 1 < groups.length) setG(g + 1);
    else onClose();
  };
  const prev = () => {
    if (i > 0) setI(i - 1);
    else if (g > 0) setG(g - 1);
  };
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onClick={onClose}>
      <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center"><ChevronLeft /></button>
      <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center"><ChevronRight /></button>
      <button onClick={onClose} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center"><X /></button>
      <div className="relative w-full max-w-md aspect-[9/16] mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
          {group.items.map((_: any, k: number) => (
            <span key={k} className="flex-1 h-0.5 bg-white/30 rounded overflow-hidden">
              <span className={`block h-full bg-white ${k < i ? "w-full" : k === i ? "animate-[grow_5s_linear]" : "w-0"}`} />
            </span>
          ))}
        </div>
        <div className="absolute top-5 left-2 right-2 flex items-center gap-2 z-10 text-white">
          {group.author?.avatar
            ? <img src={group.author.avatar} className="w-8 h-8 rounded-full object-cover" />
            : <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{(group.author?.display_name ?? "U").slice(0,2).toUpperCase()}</span>}
          <span className="font-semibold">{group.author?.display_name}</span>
        </div>
        {item.image_url ? <img src={item.image_url} className="w-full h-full object-contain rounded-xl" /> : (
          <div className="w-full h-full gradient-purple-pink rounded-xl flex items-center justify-center text-white text-xl font-bold p-8 text-center">{item.text}</div>
        )}
        {item.image_url && item.text && (
          <div className="absolute bottom-6 left-4 right-4 text-white text-center font-bold">{item.text}</div>
        )}
      </div>
    </div>
  );
}
