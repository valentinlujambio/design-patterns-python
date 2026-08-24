import type { Metadata } from "next";
import { PaginaPatron } from "@/components/pagina-patron";
import { getPattern, patternsByTrack } from "@/lib/content";

export function generateStaticParams() {
  return patternsByTrack("ia").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPattern(slug);
  if (!p) return { title: "Patrón no encontrado" };
  return { title: p.name, description: p.intent };
}

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PaginaPatron slug={slug} />;
}
