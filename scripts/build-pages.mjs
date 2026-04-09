import { build } from "esbuild";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const staticDir = path.join(root, "static");

await mkdir(staticDir, { recursive: true });

await build({
  absWorkingDir: root,
  entryPoints: ["web/main.tsx"],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  outfile: "static/app.js",
  jsx: "automatic",
  sourcemap: false,
  minify: true
});

await copyFile(
  path.join(root, "apps/msk-referral/app/globals.css"),
  path.join(staticDir, "styles.css")
);

await writeFile(path.join(root, ".nojekyll"), "");
