import { cx } from "@ariakit/core/utils/misc";
import { VisuallyHidden } from "ariakit/visually-hidden";
import Link from "next/link";
import { useRouter } from "next/router";
import GlobalNotification from "../global-notification";
import Logo from "../logo";
import Nav from "./nav";
import ThemeSwitch from "./theme-switch";
import VersionSelect from "./version-select";

export default function Header() {
  const router = useRouter();
  const isHome = router.pathname === "/";
  return (
    <div
      className={cx(
        "sticky top-0 left-0 z-40 w-full",
        "flex justify-center",
        "bg-gray-50 dark:bg-gray-800",
        "backdrop-blur supports-backdrop-blur:bg-gray-50/80 dark:supports-backdrop-blur:bg-gray-800/80"
      )}
    >
      <div className="flex w-full max-w-[1440px] items-center gap-4 p-3 sm:p-4">
        <Link href="/">
          <a
            className={cx(
              "flex items-center gap-2 rounded-[9px]",
              "focus-visible:ariakit-outline"
            )}
          >
            <VisuallyHidden>Ariakit</VisuallyHidden>
            <Logo iconOnly={!isHome} />
          </a>
        </Link>
        <div className="flex items-center gap-1">
          <VersionSelect />
          <Nav />
        </div>
        <div className="flex-1" />
        {!isHome && <GlobalNotification size="sm" />}
        <ThemeSwitch />
      </div>
    </div>
  );
}
