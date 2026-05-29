import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self' https://www.youtube.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source:
          "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/refutaciones-a-los-argumentos-de-la-iglesia-catolica",
        destination:
          "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/refutaciones-argumentos-iglesia-catolica",
        permanent: true,
      },
      {
        source:
          "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/ejemplos-de-culto-a-los-santos",
        destination:
          "/apologetica/no-conviene-a-la-iglesia-catolica-el-culto-a-los-santos/topicos/ejemplo-de-culto-a-los-santos",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
