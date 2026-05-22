import type { ReactNode } from "react";

export type PageShellProps = {
  children: ReactNode;
  leftRail?: ReactNode;
  rightRail?: ReactNode;
  /** Extra classes on the outer wrapper */
  className?: string;
  /** Extra classes on the main column */
  mainClassName?: string;
};

/**
 * Controlled layout: optional left/right rails + main.
 * When no rails, main is centered with max width (polished single column).
 * Rails are hidden below `lg` so mobile stays a single column.
 */
export function PageShell({
  children,
  leftRail,
  rightRail,
  className = "",
  mainClassName = "",
}: PageShellProps) {
  const hasRails = Boolean(leftRail) || Boolean(rightRail);

  if (!hasRails) {
    return (
      <div
        className={`flex min-h-0 flex-1 flex-col ${className}`}
      >
        <div
          className={`mx-auto w-full max-w-[1840px] flex-1 bg-[var(--background)] px-4 py-6 sm:px-6 md:py-8 lg:px-8 xl:px-12 ${mainClassName}`}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto flex w-full max-w-[1840px] min-h-0 flex-1 flex-col gap-6 bg-[var(--background)] px-4 py-6 sm:px-6 md:py-8 lg:flex-row lg:gap-8 lg:px-8 xl:px-12 ${className}`}
    >
      {leftRail ? (
        <aside className="order-2 hidden w-full shrink-0 lg:order-1 lg:block lg:w-56 xl:w-64">
          {leftRail}
        </aside>
      ) : null}
      <div
        className={`order-1 min-w-0 flex-1 lg:order-2 ${mainClassName}`}
      >
        {children}
      </div>
      {rightRail ? (
        <aside className="order-3 hidden w-full shrink-0 lg:block lg:w-56 xl:w-64">
          {rightRail}
        </aside>
      ) : null}
    </div>
  );
}
