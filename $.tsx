import { createFileRoute } from "@tanstack/react-router";
import ClientOnly from "../legacy/ClientOnly";

export const Route = createFileRoute("/$")({
  component: ClientOnly,
});
