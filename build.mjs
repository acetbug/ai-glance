import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";

const isWatch = process.argv.includes("--watch");
const distDir = "dist";

// Ensure dist directory
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(path.join(distDir, "icons"), { recursive: true });

// Copy static assets
function copyStatic() {
  fs.copyFileSync("manifest.json", path.join(distDir, "manifest.json"));

  // Copy icons if they exist
  const iconsDir = "icons";
  if (fs.existsSync(iconsDir)) {
    for (const f of fs.readdirSync(iconsDir)) {
      fs.copyFileSync(path.join(iconsDir, f), path.join(distDir, "icons", f));
    }
  }
}

copyStatic();

const baseBuildOptions = {
  bundle: true,
  target: ["chrome110"],
  minify: !isWatch,
  sourcemap: isWatch ? "inline" : false,
};

const contentBuildOptions = {
  ...baseBuildOptions,
  entryPoints: ["src/content.js"],
  outfile: path.join(distDir, "content.js"),
  format: "iife",
};

const moduleBuildOptions = {
  ...baseBuildOptions,
  entryPoints: ["src/background.js", "src/offscreen.js"],
  outdir: distDir,
  format: "esm",
};

if (isWatch) {
  const contentCtx = await esbuild.context(contentBuildOptions);
  const moduleCtx = await esbuild.context(moduleBuildOptions);
  await contentCtx.watch();
  await moduleCtx.watch();
  fs.copyFileSync("src/offscreen.html", path.join(distDir, "offscreen.html"));
  console.log("Watching for changes...");
} else {
  await esbuild.build(contentBuildOptions);
  await esbuild.build(moduleBuildOptions);

  // Bundle CSS
  const cssFiles = ["src/content.css"];
  const cssContent = cssFiles
    .filter((f) => fs.existsSync(f))
    .map((f) => fs.readFileSync(f, "utf-8"))
    .join("\n");
  fs.writeFileSync(path.join(distDir, "content.css"), cssContent);
  fs.copyFileSync("src/offscreen.html", path.join(distDir, "offscreen.html"));

  console.log("Build complete → dist/");
}
