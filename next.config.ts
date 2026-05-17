import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  turbopack: {
    // Pin project root so Turbopack does not pick a parent folder lockfile (run `npm run dev` from CursorBuildathon).
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
