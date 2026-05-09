import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CURRICULUM, getUnitBySlug, getNeighborUnits } from "@/lib/curriculum";
import { UnitImmersive } from "./UnitImmersive";

export function generateStaticParams() {
    return CURRICULUM.flatMap((p) => p.units.map((u) => ({ slug: u.slug })));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const found = getUnitBySlug(slug);
    if (!found) {
        return {
            title: "Unit not found — 28 Principles",
            description: "This unit does not exist in the Imperium curriculum.",
        };
    }
    const { phase, unit } = found;
    const title = `Unit ${unit.id}: ${unit.title} — 28 Principles`;
    const description = unit.quote;
    return {
        title,
        description,
        openGraph: {
            title,
            description: `Phase ${phase.roman} · ${phase.name} — ${unit.quote}`,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

export default async function UnitPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const found = getUnitBySlug(slug);
    if (!found) notFound();
    const { phase, unit } = found;
    const { prev, next } = getNeighborUnits(unit.id);

    return <UnitImmersive phase={phase} unit={unit} prev={prev} next={next} />;
}
