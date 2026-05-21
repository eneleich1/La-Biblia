import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PageShell } from "@/components/layout/PageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className={inter.className}>
        <ThemeProvider>
          <SiteHeader />
          <PageShell>{children}</PageShell>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
