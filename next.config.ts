import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que Turbopack detecte el workspace root en /Users/gaspar (hay un
  // package-lock.json ahí porque este directorio no tiene repo Git propio).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
