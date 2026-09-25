import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Plain-file hosting (FTP/Apache): emit static HTML, no Node server.
  output: 'export',
  // Directory-style URLs so /hu/jatek/ resolves to index.html on Apache.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default withNextIntl(nextConfig);
