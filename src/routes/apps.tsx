import { createFileRoute } from "@tanstack/react-router";
import { ArchivePage } from "./games.index";

export const Route = createFileRoute("/apps")({
  head: () => ({ meta: [{ title: "Apps — Creative Conor" }] }),
  component: () => <ArchivePage kind="apps" title="Apps" />,
});
