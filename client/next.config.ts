import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const target = new URL(
      process.env.API_PROXY_TARGET ?? "http://localhost:8000",
    );
    if (
      !["http:", "https:"].includes(target.protocol) ||
      target.pathname !== "/" ||
      target.search ||
      target.hash ||
      target.username ||
      target.password
    ) {
      throw new Error(
        "API_PROXY_TARGET must be an HTTP(S) origin without a path or credentials.",
      );
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${target.origin}/api/v1/:path*`,
      },
    ];
  },
  experimental: {
    proxyClientMaxBodySize: "15mb",
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
