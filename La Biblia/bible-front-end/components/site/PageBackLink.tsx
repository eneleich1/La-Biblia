import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  href: string;
  label: string;
};

export function PageBackLink({ href, label }: Props) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] no-underline transition hover:underline"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
      {label}
    </Link>
  );
}
