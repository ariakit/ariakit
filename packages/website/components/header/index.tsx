import { cx } from "ariakit-utils/misc";
import { VisuallyHidden } from "ariakit/visually-hidden";
import Link from "next/link";
import { useRouter } from "next/router";
import button from "../../styles/button";
import Logo from "../logo";
import VersionSelect from "../version-select";

const separator = <div className="opacity-30 font-semibold">/</div>;

export default function Header() {
  const router = useRouter();
  const isHome = router.pathname === "/";

  const breadcrumbs = (
    <>
      {separator}
      <button
        className={cx(
          button(),
          "rounded-lg h-8 px-2 focus-visible:ariakit-outline-input"
        )}
      >
        Examples
      </button>
      {separator}
      <button
        className={cx(
          button(),
          "rounded-lg h-8 px-2 focus-visible:ariakit-outline-input"
        )}
      >
        Form with Select
      </button>
    </>
  );

  const links = (
    <div className="flex gap-8 ml-8">
      <Link href="/guide">Guide</Link>
      <Link href="/components">Components</Link>
      <Link href="/examples">Examples</Link>
    </div>
  );

  return (
    <div
      className={cx(
        "sticky top-0 left-0 w-full z-40",
        "flex pr-[var(--scrollbar-width)] justify-center",
        "bg-canvas-2 dark:bg-canvas-2-dark",
        "backdrop-blur supports-backdrop-blur:bg-canvas-2/80 dark:supports-backdrop-blur:bg-canvas-2-dark/80"
      )}
    >
      <div className="flex items-center gap-4 p-3 sm:p-4 w-full max-w-[1440px]">
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
        <div className="flex gap-1 items-center">
          <VersionSelect />
          {isHome ? links : breadcrumbs}
        </div>
        <button
          className={cx(button(), "ml-auto")}
          onClick={() => {
            if (document.documentElement.classList.contains("dark")) {
              document.documentElement.classList.remove("dark");
              document.documentElement.classList.add("light");
              localStorage.setItem("theme", "light");
            } else {
              document.documentElement.classList.remove("light");
              document.documentElement.classList.add("dark");
              localStorage.setItem("theme", "dark");
            }
          }}
        >
          Toggle dark mode
        </button>
      </div>
    </div>
  );
}
