import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
