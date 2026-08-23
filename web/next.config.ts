import path from "node:path";
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // On now that every screen in `docs/SPEC.md` §A6 exists: a link to a route that is
  // not there is a type error rather than a 404 found by clicking.
  typedRoutes: true,
  // The UI dictionaries live in the repository-wide `locales/` directory, one level
  // above this app, so the workspace root is the repository - not `web/`.
  turbopack: { root: path.join(__dirname, "..") },
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default config;
