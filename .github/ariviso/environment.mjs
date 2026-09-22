import {
  readdir,
  readFile,
  realpath,
  mkdir,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { chromium, firefox, webkit, devices } from "@playwright/test";
import { digestJson, sha256, projects } from "./identity.mjs";

const repositoryRoot =
  process.env.GITHUB_WORKSPACE ?? path.resolve(import.meta.dirname, "../..");
const require = createRequire(path.join(repositoryRoot, "app/package.json"));
const settings = JSON.parse(
  await readFile(new URL("settings.json", import.meta.url), "utf8"),
);
const browserName = process.env.ARIVISO_BROWSER;
const project = projects[browserName];
if (!project)
  throw new Error("Set ARIVISO_BROWSER to chromium, firefox, or webkit");

async function fontFiles(directory, relative = "") {
  let entries;
  try {
    entries = await readdir(path.join(directory, relative), {
      withFileTypes: true,
    });
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
  const files = [];
  for (const entry of entries) {
    const file = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...(await fontFiles(directory, file)));
    else if (/\.(ttf|otf|ttc|woff2?)$/i.test(entry.name)) {
      files.push({
        file: file.split(path.sep).join("/"),
        digest: sha256(await readFile(path.join(directory, file))),
      });
    }
  }
  return files.sort((left, right) => left.file.localeCompare(right.file, "en"));
}

const fontSource = await realpath(
  path.dirname(require.resolve("@fontsource-variable/inter/package.json")),
);
const fontRoots =
  process.platform === "darwin"
    ? ["/System/Library/Fonts", "/Library/Fonts", fontSource]
    : ["/usr/share/fonts", "/usr/local/share/fonts", fontSource];
const fonts = [];
for (const [index, root] of fontRoots.entries()) {
  for (const file of await fontFiles(root))
    fonts.push({ root: index, ...file });
}
if (!fonts.length)
  throw new Error("No system or application fonts were measured");
const osImage = {
  os: process.env.ImageOS ?? process.platform,
  imageVersion: process.env.ImageVersion ?? "local-probe-only",
  architecture: process.arch,
};
const profile = {
  osImageDigest: digestJson(osImage),
  fontsDigest: digestJson(fonts),
  comparisonPolicyDigest: digestJson(settings.comparisonPolicy),
  comparisonEngineVersion: settings.comparisonEngineVersion,
};
const engine = { chromium, firefox, webkit }[browserName];
const browser = await engine.launch(
  browserName === "chromium" ? { channel: "chromium" } : {},
);
const profiles = new Map();
try {
  // These are the explicit viewport sizes in the visual capture callers.
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
    { width: 400, height: 800 },
    { width: 1440, height: 900 },
    { width: 560, height: 900 },
    { width: 560, height: 400 },
  ]) {
    const context = await browser.newContext({
      ...devices[project.device],
      viewport,
      locale: "en-US",
      timezoneId: "UTC",
      reducedMotion: "reduce",
    });
    try {
      const page = await context.newPage();
      for (const colorScheme of ["light", "dark"]) {
        for (const contrast of ["no-preference", "more"]) {
          for (const forcedColors of ["none", "active"]) {
            await page.emulateMedia({ colorScheme, contrast, forcedColors });
            const media = await page.evaluate(() => ({
              viewport: { width: innerWidth, height: innerHeight },
              deviceScaleFactor: devicePixelRatio,
              locale: navigator.language,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              reducedMotion: matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "reduce"
                : "no-preference",
              colorScheme: matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light",
              contrast: matchMedia("(prefers-contrast: more)").matches
                ? "more"
                : "no-preference",
              forcedColors: matchMedia("(forced-colors: active)").matches
                ? "active"
                : "none",
            }));
            for (const fullPage of [false, true]) {
              const value = {
                ...profile,
                browser: browserName,
                browserVersion: browser.version(),
                ...media,
                animationPolicy: "disabled",
                captureOptions: {
                  type: "png",
                  animations: "disabled",
                  caret: "hide",
                  scale: "css",
                  fullPage,
                  omitBackground: false,
                },
              };
              profiles.set(digestJson(value), value);
            }
          }
        }
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
const result = {
  browser: browserName,
  osImage,
  profile,
  fonts,
  environmentProfiles: [...profiles].map(([digest, value]) => ({
    digest,
    profile: value,
  })),
};
const directory = path.join(repositoryRoot, "app/.ariviso-results");
await mkdir(directory, { recursive: true });
await writeFile(
  path.join(directory, `environment-${browserName}.json`),
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(
  `Measured ${profiles.size} ${browserName} environment profiles; ${fonts.length} font files`,
);
