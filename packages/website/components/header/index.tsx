import { cx } from "ariakit-utils/misc";
import { VisuallyHidden } from "ariakit/visually-hidden";
import Link from "next/link";
import { useRouter } from "next/router";
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
        "bg-canvas-2 dark:bg-canvas-2-dark",
        "backdrop-blur supports-backdrop-blur:bg-canvas-2/80 dark:supports-backdrop-blur:bg-canvas-2-dark/80"
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
        <ThemeSwitch className="ml-auto" />
      </div>
    </div>
  );
}
