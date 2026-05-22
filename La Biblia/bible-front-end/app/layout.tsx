import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { PageShell } from "@/components/layout/PageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  DEFAULT_THEME,
  THEME_COOKIE_KEY,
  THEME_STORAGE_KEY,
  ThemeProvider,
  type SiteTheme,
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
};

function normalizeTheme(theme: string | undefined): SiteTheme {
  return theme === "warm" || theme === "blue" ? theme : DEFAULT_THEME;
}

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialTheme = normalizeTheme(cookieStore.get(THEME_COOKIE_KEY)?.value);

  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable}`}
      data-site-theme={initialTheme}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider initialTheme={initialTheme}>
          <SiteHeader />
          <PageShell>{children}</PageShell>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
