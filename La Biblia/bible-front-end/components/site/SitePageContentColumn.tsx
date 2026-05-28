import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Misma columna que `app/predicaciones/page.tsx` (`.sermons-index-page`). */
export function SitePageContentColumn({ children, className = "" }: Props) {
  return <div className={`sermons-index-page ${className}`.trim()}>{children}</div>;
}
