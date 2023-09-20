import Link from "next/link.js";
import { getUpdates } from "utils/get-updates.js";
import { HeaderLogo } from "./header-logo.js";
import { HeaderNav } from "./header-nav.js";
import { HeaderThemeSwitch } from "./header-theme-switch.js";
import { HeaderUpdates } from "./header-updates.jsx";
import { HeaderVersionSelect } from "./header-version-select.js";

let versionsCache: Record<string, Record<string, string>> | null = null;

function fetchPackage(name: string) {
  const buildId = process.env.NEXT_BUILD_ID;
  const cacheString = buildId ? `?${buildId}` : "";
  return fetch(
    `https://registry.npmjs.org/-/package/${name}/dist-tags${cacheString}`,
  );
}

async function fetchVersions() {
  if (versionsCache) {
    return versionsCache;
  }
  const [react] = await Promise.all([
    fetchPackage("@ariakit/react"),
    // fetchPackage("@ariakit/dom"),
  ]);

  if (!react.ok) {
    throw new Error("Failed to fetch versions");
  }

  const reactTags = await react.json();
  // const domTags = await dom.json();

  const versions = {
    "@ariakit/react": reactTags as Record<string, string>,
    // "@ariakit/dom": domTags,
  };

  versionsCache = versions;

  return versions;
}

export async function Header() {
  const versions = await fetchVersions();
  const updates = await getUpdates();
  return (
    <div className="sticky left-0 top-0 z-40 flex w-full justify-center bg-gray-50 dark:bg-gray-800 md:backdrop-blur md:supports-backdrop-blur:bg-gray-50/80 md:dark:supports-backdrop-blur:bg-gray-800/80">
      <div className="flex w-full max-w-[1440px] items-center gap-4 px-3 py-2 md:px-4 md:py-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-[9px] focus-visible:ariakit-outline"
        >
          <span className="sr-only">Ariakit</span>
          <HeaderLogo />
        </Link>
        <div className="flex items-center gap-1 overflow-x-clip px-0.5">
          <HeaderVersionSelect versions={versions} />
          <HeaderNav />
        </div>
        <div className="flex-1" />
        <HeaderUpdates updates={updates.slice(0, 15)} />
        <HeaderThemeSwitch />
      </div>
    </div>
  );
}
