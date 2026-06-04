import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSettings, adminSaveSetting } from "@/lib/menu.functions";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const getFn = useServerFn(getSettings);
  const saveFn = useServerFn(adminSaveSetting);
  const { data, refetch } = useQuery({ queryKey: ["settings"], queryFn: () => getFn({}) });
  const [site, setSite] = useState({ title: "", tagline: "" });
  const [community, setCommunity] = useState({ discord: "", telegram: "", youtube: "" });
  useEffect(() => {
    if (data?.settings) {
      setSite(data.settings.site ?? site);
      setCommunity(data.settings.community ?? community);
    }
  }, [data]);
  const save = useMutation({
    mutationFn: async () => {
      await saveFn({ data: { key: "site", value: site } });
      await saveFn({ data: { key: "community", value: community } });
    },
    onSuccess: () => refetch(),
  });
  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-display font-black mb-6">Settings</h1>
      <h2 className="font-bold mb-2">Site</h2>
      <input value={site.title} onChange={(e) => setSite({ ...site, title: e.target.value })} placeholder="Title" className="w-full mb-2 h-10 px-3 rounded bg-secondary border border-border" />
      <input value={site.tagline} onChange={(e) => setSite({ ...site, tagline: e.target.value })} placeholder="Tagline" className="w-full mb-4 h-10 px-3 rounded bg-secondary border border-border" />
      <h2 className="font-bold mb-2">Community links</h2>
      <input value={community.discord} onChange={(e) => setCommunity({ ...community, discord: e.target.value })} placeholder="Discord URL" className="w-full mb-2 h-10 px-3 rounded bg-secondary border border-border" />
      <input value={community.telegram} onChange={(e) => setCommunity({ ...community, telegram: e.target.value })} placeholder="Telegram URL" className="w-full mb-2 h-10 px-3 rounded bg-secondary border border-border" />
      <input value={community.youtube} onChange={(e) => setCommunity({ ...community, youtube: e.target.value })} placeholder="YouTube URL" className="w-full mb-4 h-10 px-3 rounded bg-secondary border border-border" />
      <button onClick={() => save.mutate()} disabled={save.isPending} className="community-btn px-5 h-11 rounded-full text-white font-bold">{save.isPending ? "Saving…" : "Save"}</button>
    </div>
  );
}
