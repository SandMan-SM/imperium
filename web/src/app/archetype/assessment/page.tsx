import type { Metadata } from "next";
import { RunnerScreen } from "@/components/assessments/RunnerScreen";
import { getMeta } from "@/lib/assessments";

const meta = getMeta("archetype")!;
export const metadata: Metadata = {
  title: `${meta.title} — Imperium Elite`,
  description: meta.blurb,
};

export default function Page() {
  return <RunnerScreen slug="archetype" />;
}
