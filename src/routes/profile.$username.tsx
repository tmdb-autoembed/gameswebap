import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfileByUsername, getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { listFeed, toggleFollow, isFollowing } from "@/lib/community.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FeedCard } from "@/components/community/feed-card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, UserCheck, MessageSquare, Pencil, Camera, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/use-image-upload";

export const Route = createFileRoute("/profile/$username")({
  component: ProfilePage,
});

function ProfilePage() {
  const { username } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const getFn = useServerFn(getProfileByUsername);
  const feedFn = useServerFn(listFeed);
  const followFn = useServerFn(toggleFollow);
  const isFollowFn = useServerFn(isFollowing);
  const meFn = useServerFn(getMyProfile);

  const [me, setMe] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null)); }, []);

  const { data } = useQuery({ queryKey: ["profile", username], queryFn: () => getFn({ data: { username } }) });
  const prof = data?.profile;
  const isMe = me && prof && me === prof.user_id;
  const { data: myProf } = useQuery({ queryKey: ["my-profile", me], queryFn: () => meFn({}), enabled: !!me });

  const { data: feedData } = useQuery({
    queryKey: ["author-feed", prof?.user_id],
    queryFn: () => feedFn({ data: { authorId: prof!.user_id, limit: 30 } }),
    enabled: !!prof,
  });

  const { data: followingData } = useQuery({
    queryKey: ["follow", me, prof?.user_id],
    queryFn: () => isFollowFn({ data: { targetId: prof!.user_id } }),
    enabled: !!me && !!prof && !isMe,
  });

  const toggle = useMutation({
    mutationFn: () => followFn({ data: { targetId: prof!.user_id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["follow"] }); qc.invalidateQueries({ queryKey: ["profile", username] }); },
  });


  if (!prof) return <div className="min-h-screen"><SiteHeader /><p className="p-12 text-center text-muted-foreground">Profile not found</p></div>;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-4xl mx-auto pb-12">
        <ProfileHeader prof={prof} myProf={myProf?.profile} isMe={!!isMe} />
        <div className="px-4 mt-5 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl md:text-3xl font-black">{prof.display_name}</h1>
          <span className="text-muted-foreground">@{prof.username}</span>
          <div className="ml-auto flex gap-2">
            {!isMe && me && (
              <>
                <button onClick={() => toggle.mutate()} className={`flex items-center gap-1.5 h-10 px-4 rounded-full font-bold text-sm ${followingData?.following ? "glass text-foreground" : "community-btn text-white"}`}>
                  {followingData?.following ? <><UserCheck size={16} /> Following</> : <><UserPlus size={16} /> Follow</>}
                </button>
                <button onClick={() => navigate({ to: "/messages/$peerId", params: { peerId: prof.user_id } })}
                  className="flex items-center gap-1.5 h-10 px-4 rounded-full glass font-bold text-sm">
                  <MessageSquare size={16} /> Message
                </button>
              </>
            )}
          </div>
        </div>

        {prof.bio && <p className="px-4 mt-2 text-foreground/80 max-w-2xl">{prof.bio}</p>}

        <div className="px-4 mt-4 flex gap-5 text-sm">
          <Stat n={prof.post_count} label="Posts" />
          <Stat n={prof.followers} label="Followers" />
          <Stat n={prof.following} label="Following" />
        </div>

        <h2 className="px-4 mt-8 mb-3 font-display font-bold text-lg flex items-center gap-2"><Users size={18} className="text-brand-cyan" /> Posts</h2>
        <div className="px-4 space-y-4">
          {(feedData?.posts ?? []).map((p: any) => <FeedCard key={p.id} post={p} currentUserId={me} />)}
          {(feedData?.posts ?? []).length === 0 && <p className="text-muted-foreground">No posts yet.</p>}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return <div><strong className="text-lg">{n}</strong> <span className="text-muted-foreground">{label}</span></div>;
}

function ProfileHeader({ prof, isMe }: { prof: any; myProf: any; isMe: boolean }) {
  const qc = useQueryClient();
  const upd = useServerFn(updateMyProfile);
  const { upload, busy } = useImageUpload();
  const [editing, setEditing] = useState(false);

  const cover = prof.cover;
  return (
    <div className="relative">
      <div className="h-44 md:h-60 w-full overflow-hidden bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 relative">
        {cover && <img src={cover} className="w-full h-full object-cover" />}
        {isMe && (
          <label className="absolute bottom-3 right-3 h-9 px-3 rounded-full glass-strong text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <input type="file" accept="image/*" hidden onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const url = await upload(f, "cover");
              await upd({ data: { cover: url } });
              qc.invalidateQueries({ queryKey: ["profile"] });
            }} />
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />} Cover
          </label>
        )}
      </div>
      <div className="px-4 -mt-12 flex items-end gap-4">
        <div className="relative">
          <span className="block w-24 h-24 md:w-28 md:h-28 rounded-full p-[3px] gradient-purple-pink glow-purple">
            {prof.avatar
              ? <img src={prof.avatar} className="w-full h-full rounded-full object-cover border-2 border-background" />
              : <span className="w-full h-full rounded-full bg-card flex items-center justify-center text-xl font-bold border-2 border-background">{(prof.display_name ?? "U").slice(0,2).toUpperCase()}</span>}
          </span>
          {isMe && (
            <label className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-lg">
              <input type="file" accept="image/*" hidden onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const url = await upload(f, "avatar");
                await upd({ data: { avatar: url } });
                qc.invalidateQueries({ queryKey: ["profile"] });
              }} />
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </label>
          )}
        </div>
        {isMe && (
          <button onClick={() => setEditing(true)} className="ml-auto mb-2 h-9 px-4 rounded-full glass text-sm font-bold flex items-center gap-1.5">
            <Pencil size={14} /> Edit profile
          </button>
        )}
      </div>
      {editing && <EditProfile prof={prof} onClose={() => setEditing(false)} />}
    </div>
  );
}

function EditProfile({ prof, onClose }: any) {
  const qc = useQueryClient();
  const updFn = useServerFn(updateMyProfile);
  const [display, setDisplay] = useState(prof.display_name ?? "");
  const [bio, setBio] = useState(prof.bio ?? "");
  const [username, setUsername] = useState(prof.username ?? "");
  const save = useMutation({
    mutationFn: () => updFn({ data: { display_name: display, bio, username } }),
    onSuccess: () => { qc.invalidateQueries(); onClose(); },
  });
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-strong rounded-2xl p-5 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-black">Edit profile</h3>
        <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} placeholder="username" className="w-full h-10 px-3 rounded-lg bg-secondary outline-none" />
        <input value={display} onChange={(e) => setDisplay(e.target.value)} placeholder="Display name" className="w-full h-10 px-3 rounded-lg bg-secondary outline-none" />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" rows={3} className="w-full px-3 py-2 rounded-lg bg-secondary outline-none resize-none" />
        {save.error && <p className="text-xs text-destructive">{(save.error as Error).message}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="h-9 px-4 rounded-full glass text-sm">Cancel</button>
          <button onClick={() => save.mutate()} disabled={save.isPending} className="h-9 px-4 rounded-full community-btn text-white text-sm font-bold">Save</button>
        </div>
      </div>
    </div>
  );
}
