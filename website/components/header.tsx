import Link from "next/link.js";
import { getUpdates } from "@/lib/get-updates.ts";
import { getPagesByTag } from "@/lib/tag.ts";
import { AuthEnabled } from "./auth.tsx";
import { HeaderAriakitPlus } from "./header-ariakit-plus.tsx";
import { HeaderLogo } from "./header-logo.tsx";
import { HeaderNav } from "./header-nav.tsx";
import { HeaderThemeSwitch } from "./header-theme-switch.tsx";
import { HeaderUpdates } from "./header-updates.tsx";
import { HeaderVersionSelect } from "./header-version-select.tsx";

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
  const plusPages = getPagesByTag("Plus").map(
    (page) => `/${page.category}/${page.slug}`,
  );
  return (
    <div className="sticky left-0 top-0 z-40 flex w-full justify-center bg-gray-50 dark:bg-gray-800">
      <div className="flex h-[--header-height] w-full max-w-[--size-wide] items-center gap-2 px-[--page-padding] sm:gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-[9px] focus-visible:ariakit-outline"
        >
          <span className="sr-only">Ariakit</span>
          <HeaderLogo />
        </Link>
        <div className="flex items-center gap-1 overflow-x-clip px-1">
          <HeaderVersionSelect versions={versions} />
          <HeaderNav />
        </div>
        <div className="flex-1" />
        <div
          id="call-to-action-slot"
          className="flex h-full items-center overflow-y-clip"
        />
        <AuthEnabled>
          <HeaderAriakitPlus />
        </AuthEnabled>
        <HeaderUpdates updates={updates.slice(0, 15)} plusPages={plusPages} />
        <HeaderThemeSwitch />
      </div>
    </div>
  );
}
