import { createFileRoute } from "@tanstack/react-router";
import { KaraokeApp } from "@/components/karaoke-app";

export const Route = createFileRoute("/")({ component: KaraokeApp });
