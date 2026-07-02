import { createFileRoute } from "@tanstack/react-router";
import ClientOnly from "../legacy/ClientOnly";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clinical Trial Companion" },
      { name: "description", content: "Manage appointments, medications, reports, and care for your clinical trial." },
      { property: "og:title", content: "Clinical Trial Companion" },
      { property: "og:description", content: "Manage appointments, medications, reports, and care for your clinical trial." },
    ],
  }),
  component: ClientOnly,
});
