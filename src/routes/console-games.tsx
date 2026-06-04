import { createFileRoute } from "@tanstack/react-router";
import { ArchivePage } from "./games.index";

export const Route = createFileRoute("/console-games")({
  head: () => ({ meta: [{ title: "Console Games — Creative Conor" }] }),
  component: () => <ArchivePage kind="console" title="Console Games" />,
});
