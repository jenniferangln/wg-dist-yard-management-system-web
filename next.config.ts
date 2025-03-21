import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";


const nextConfig: NextConfig = {
  /* config options here */
  assetPrefix: "/yard-management-system-static",
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);