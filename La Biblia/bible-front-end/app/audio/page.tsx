import { redirect } from "next/navigation";
import { getSupportedStaticLanguages } from "@/lib/staticBible";

export default function AudioIndexPage() {
  const [language] = getSupportedStaticLanguages();
  redirect(`/audio/${language ?? "es"}`);
}
