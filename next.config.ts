import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone server bundle for the Docker/Cloud Run runtime image (lib/db/control.ts
  // and lib/db/tenant-client.ts pull in two separate Prisma clients, so the Dockerfile
  // also copies their generated/engine files explicitly — tracing alone can miss
  // native query-engine binaries).
  // Self-contained production output (.next/standalone + server.js). Lets the
  // Docker runtime image ship without node_modules. See Dockerfile + docs/deployment.md.
  output: "standalone",
};

export default nextConfig;
