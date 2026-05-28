import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PageShell } from "@/components/layout/PageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { HashAnchorScroller } from "@/components/navigation/HashAnchorScroller";
import {
  DEFAULT_THEME,
  DEFAULT_BIBLE_INDEX_MODE,
  THEME_COOKIE_KEY,
  THEME_STORAGE_KEY,
  ThemeProvider,
} from "@/components/theme/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Seek of Truth — Plataforma Bíblica Cristiana",
  description:
    "Plataforma cristiana: Biblia de Jerusalén, búsqueda, audio, estudios, lecturas y recursos de apologética.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
};

function themeInitScript() {
  return `
try {
  var key = ${JSON.stringify(THEME_STORAGE_KEY)};
  var cookieKey = ${JSON.stringify(THEME_COOKIE_KEY)};
  var theme = localStorage.getItem(key);
  if (theme !== "warm" && theme !== "blue") {
    var match = document.cookie.match(new RegExp("(?:^|; )" + cookieKey + "=([^;]*)"));
    theme = match ? decodeURIComponent(match[1]) : ${JSON.stringify(DEFAULT_THEME)};
  }
  if (theme !== "warm" && theme !== "blue") theme = ${JSON.stringify(DEFAULT_THEME)};
  document.documentElement.dataset.siteTheme = theme;
  document.cookie = cookieKey + "=" + theme + "; Path=/; Max-Age=31536000; SameSite=Lax";
} catch (e) {}
`;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable}`}
      data-site-theme={DEFAULT_THEME}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <ThemeProvider
          initialTheme={DEFAULT_THEME}
          initialBibleIndexMode={DEFAULT_BIBLE_INDEX_MODE}
        >
          <Suspense fallback={null}>
            <HashAnchorScroller />
          </Suspense>
          <SiteHeader />
          <div className="flex flex-1 flex-col pt-[78px] sm:pt-[84px]">
            <PageShell>{children}</PageShell>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
