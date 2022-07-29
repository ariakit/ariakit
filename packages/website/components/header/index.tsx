import { useState } from "react";
import { cx } from "ariakit-utils/misc";
import {
  Menu,
  MenuBar,
  MenuButton,
  MenuItem,
  MenuList,
  useMenuBarState,
  useMenuState,
} from "ariakit/menu";
import {
  Select,
  SelectItem,
  SelectList,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import { VisuallyHidden } from "ariakit/visually-hidden";
import startCase from "lodash/startCase";
import Link from "next/link";
import { useRouter } from "next/router";
import meta from "../../meta";
import button from "../../styles/button";
import Logo from "../logo";
import { PageMenu, PageMenuItem } from "./page-menu";
import VersionSelect from "./version-select";

const separator = <div className="opacity-30 font-semibold">/</div>;

export default function Header() {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const [, category, page] = router.asPath.split("/");
  const menubar = useMenuBarState();
  const categorySelect = useSelectState({
    fixed: true,
    value: category,
  });
  const pageSelect = useSelectState({ fixed: true, value: page });
  const categoryMenu = useMenuState(categorySelect);
  const pageMenu = useMenuState(pageSelect);
  const [matches, setMatches] = useState<string[]>([]);

  const breadcrumbs = category ? (
    <>
      {separator}
      <MenuBar state={menubar} className="flex gap-1 items-center">
        <Select state={categorySelect}>
          {(props) => (
            <MenuButton
              as={MenuItem}
              {...props}
              showOnHover={false}
              focusOnHover={false}
              state={categoryMenu}
            >
              {startCase(categorySelect.value)}
            </MenuButton>
          )}
        </Select>
        {categorySelect.mounted && (
          <SelectPopover
            portal
            state={categorySelect}
            className={cx(
              "max-h-[var(--popover-available-height)] overflow-auto",
              "flex flex-col z-50 bg-canvas-5 dark:bg-canvas-5-dark",
              "rounded-lg drop-shadow-lg dark:drop-shadow-lg-dark",
              "p-2 border border-solid border-canvas-5 dark:border-canvas-5-dark"
            )}
          >
            {(props) => (
              <MenuList state={categoryMenu} {...props}>
                {Object.keys(meta)?.map((key) => (
                  <PageMenuItem key={key} value={key} href={`/${key}`}>
                    {startCase(key)}
                  </PageMenuItem>
                ))}
              </MenuList>
            )}
          </SelectPopover>
        )}
        {page && (
          <>
            {separator}
            <Select state={pageSelect}>
              {(props) => (
                <MenuButton
                  as={MenuItem}
                  {...props}
                  showOnHover={false}
                  focusOnHover={false}
                  state={pageMenu}
                >
                  {
                    meta[category]?.find(
                      (item) => item.slug === pageSelect.value
                    )?.title
                  }
                </MenuButton>
              )}
            </Select>
            {pageSelect.mounted && (
              <SelectPopover
                portal
                state={pageSelect}
                className={cx(
                  "max-h-[var(--popover-available-height)] overflow-auto",
                  "flex flex-col z-50 bg-canvas-5 dark:bg-canvas-5-dark",
                  "rounded-lg drop-shadow-lg dark:drop-shadow-lg-dark",
                  "p-2 border border-solid border-canvas-5 dark:border-canvas-5-dark"
                )}
              >
                {(props) => (
                  <MenuList state={pageMenu} {...props}>
                    {meta[category]?.map((item) => (
                      <PageMenuItem
                        key={item.slug}
                        value={item.slug}
                        href={`/${category}/${item.slug}`}
                      >
                        {item.title}
                      </PageMenuItem>
                    ))}
                  </MenuList>
                )}
              </SelectPopover>
            )}

            {page && (
              <>
                {separator}
                <PageMenu
                  defaultList={meta[category]?.map((item) => item.title)}
                  onMatch={setMatches}
                  value={page}
                >
                  {matches.map((value) => {
                    const item = meta[category]?.find(
                      (item) => item.title === value
                    );
                    return (
                      <PageMenuItem
                        key={item.slug}
                        value={item.slug}
                        href={`/${category}/${item.slug}`}
                      >
                        {item.title}
                      </PageMenuItem>
                    );
                  })}
                </PageMenu>
              </>
            )}
          </>
        )}
      </MenuBar>
    </>
  ) : null;

  const links = (
    <div className="flex gap-8 ml-8">
      <Link href="/guide">
        <a className="hover:underline">Guide</a>
      </Link>
      <Link href="/components">
        <a className="hover:underline">Components</a>
      </Link>
      <Link href="/examples">
        <a className="hover:underline">Examples</a>
      </Link>
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
