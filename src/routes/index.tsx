import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { HeroSlider } from "@/components/hero-slider";
import { SocialButtons } from "@/components/social-buttons";
import { GamesSection } from "@/components/games-section";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creative Conor — Free Games, Software & Apps" },
      { name: "description", content: "Download free PC games, software, and apps. Fast, secure, always up to date." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <HeroSlider />
        <SocialButtons />
        <GamesSection />
      </main>
      <SiteFooter />
    </div>
  );
}
