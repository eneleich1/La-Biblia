import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BookChaptersPage({
  params,
}: {
  params: Promise<{ language: string; bookSlug: string }>;
}) {
  const { language, bookSlug } = await params;
  redirect(`/biblia/${language}/${bookSlug}/1`);
}
