import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./registry/**/*", "./__registry__/**/*"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}
    // Route optional pino deps to local stubs to avoid hard failures in client bundles
    ;(config.resolve.alias as Record<string, any>)["pino-pretty"] = require("path").resolve(
      process.cwd(),
      "stubs/pino-pretty.js"
    )
    ;(config.resolve.alias as Record<string, any>)[
      "pino-abstract-transport"
    ] = require("path").resolve(process.cwd(), "stubs/pino-abstract-transport.js")
    ;(config.resolve.alias as Record<string, any>)[
      "@/lib/google-fonts-loader"
    ] = require("path").resolve(process.cwd(), "src/lib/google-fonts-loader.ts")
    if (process.env.OFFLINE_FONTS === "1") {
      ;(config.resolve.alias as Record<string, any>)[
        "@/lib/google-fonts-loader"
      ] = require("path").resolve(process.cwd(), "stubs/next-font-google.ts")
    }
    return config
  },
}

export default nextConfig
