import { tw } from "utils/tw.js";
import { HeaderGlobalNotification } from "./header-global-notification.js";
import { HeaderLogo } from "./header-logo.js";
import { HeaderNav } from "./header-nav.js";
import { HeaderThemeSwitch } from "./header-theme-switch.js";
import { HeaderVersionSelect } from "./header-version-select.js";
import { Link } from "./link.js";

let cache: Record<string, Record<string, string>> | null = null;

async function fetchVersions() {
  if (process.env.NODE_ENV !== "production" && cache) {
    return cache;
  }
  const [react] = await Promise.all([
    fetch("https://registry.npmjs.org/@ariakit/react"),
    // fetch("https://registry.npmjs.org/@ariakit/dom"),
  ]);

  if (!react.ok) {
    throw new Error("Failed to fetch versions");
  }

  const reactData = await react.json();
  // const domData = await dom.json();

  const versions = {
    "@ariakit/react": reactData["dist-tags"] as Record<string, string>,
    // "@ariakit/dom": domData["dist-tags"],
  };

  cache = versions;

  return versions;
}

export async function Header() {
  const versions = await fetchVersions();
  return (
    <div
      className={tw`
      sticky left-0 top-0 z-40 flex w-full justify-center
      bg-gray-50 dark:bg-gray-800 sm:backdrop-blur
      sm:supports-backdrop-blur:bg-gray-50/80
      sm:dark:supports-backdrop-blur:bg-gray-800/80`}
    >
      <div className="flex w-full max-w-[1440px] items-center gap-4 p-3 sm:p-4">
        <Link
          href="/"
          className={tw`
          flex items-center gap-2 rounded-[9px] focus-visible:ariakit-outline`}
        >
          <span className="sr-only">Ariakit</span>
          <HeaderLogo />
        </Link>
        <div className="flex items-center gap-1">
          <HeaderVersionSelect versions={versions} />
          <HeaderNav />
        </div>
        <div className="flex-1" />
        <HeaderGlobalNotification />
        <HeaderThemeSwitch />
      </div>
    </div>
  );
}
