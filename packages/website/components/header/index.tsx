import { useState } from "react";
import { cx } from "ariakit-utils/misc";
import { ComboboxItem } from "ariakit/combobox";
import { CompositeGroup, CompositeGroupLabel } from "ariakit/composite";
import {
  Menu,
  MenuBar,
  MenuButton,
  MenuItem,
  MenuList,
  useMenuBarState,
  useMenuState,
} from "ariakit/menu";
import { PopoverDisclosureArrow, PopoverDismiss } from "ariakit/popover";
import {
  Select,
  SelectItem,
  SelectList,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import { VisuallyHidden } from "ariakit/visually-hidden";
import groupBy from "lodash/groupBy";
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
  const [searchValue, setSearchValue] = useState("");

  const breadcrumbs = category ? (
    <>
      {separator}
      <PageMenu
        searchPlaceholder="Search"
        searchValue={searchValue}
        onSearch={setSearchValue}
        value={category}
        size={searchValue ? "lg" : "sm"}
      >
        {Object.keys(meta)?.map((key) => (
          <PageMenuItem key={key} value={key} href={`/${key}`}>
            {startCase(key)}
          </PageMenuItem>
        ))}
      </PageMenu>

      {page && (
        <>
          {separator}
          <PageMenu
            searchPlaceholder={`Search ${category}`}
            searchValue={searchValue}
            onSearch={setSearchValue}
            value={page}
            size="lg"
          >
            {Object.entries(groupBy(meta[category], "group")).map(
              ([group, pages]) => (
                <CompositeGroup key={group} className="bg-[color:inherit]">
                  <CompositeGroupLabel className="cursor-default p-2 pt-3 text-sm font-medium text-black/70 dark:text-white/70 bg-[color:inherit] sticky top-12 z-40">
                    {group}
                  </CompositeGroupLabel>
                  {pages.map((item, i) => {
                    return (
                      <PageMenuItem
                        key={item.slug + i}
                        value={item.slug}
                        href={`/${category}/${item.slug}`}
                        className="flex !pr-4 !gap-4 !items-start group !scroll-mt-[88px] scroll-mb-14"
                      >
                        <div
                          className={cx(
                            "flex items-center justify-center flex-none w-16 h-16 rounded-sm",
                            "bg-canvas-1 dark:bg-canvas-2-dark",
                            "group-active-item:bg-white/50 dark:group-active-item:bg-black/70"
                          )}
                        >
                          <div className="flex items-center justify-center h-4 w-8 bg-primary-2 rounded-sm shadow-sm">
                            <div className="w-4 h-1 bg-white/75 rounded-[1px]" />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold">{item.title}</span>
                          <span className="text-sm opacity-70 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                            {item.description}
                          </span>
                        </div>
                      </PageMenuItem>
                    );
                  })}
                </CompositeGroup>
              )
            )}
            <div
              role="presentation"
              className="sticky bottom-0 translate-y-2 py-2 bg-[color:inherit] z-40"
            >
              <PageMenuItem
                className="grid h-10 grid-cols-[theme(spacing.14)_auto_theme(spacing.14)] bg-canvas-1 dark:bg-canvas-5-dark"
                onClick={() => {
                  // categorySelect.show();
                }}
              >
                <PopoverDisclosureArrow placement="left" />
                <span className="text-center">
                  {searchValue ? "Search" : "Browse"} all pages
                </span>
                {/* <div
                  className={cx(
                    "text-xs text-right rounded-full p-1 px-2",
                    "text-canvas-1/70 dark:text-canvas-1-dark/70"
                  )}
                >
                  <abbr title="Command" className="no-underline">
                    ⌘
                  </abbr>
                  <span> K</span>
                </div> */}
              </PageMenuItem>
            </div>
          </PageMenu>
        </>
      )}
    </>
  ) : null;

  const links = (
    <>
      {separator}
      <PageMenu
        label="Browse"
        searchPlaceholder="Search"
        searchValue={searchValue}
        onSearch={setSearchValue}
        size={searchValue ? "lg" : "sm"}
      >
        {Object.keys(meta)?.map((key) => (
          <PageMenuItem key={key} value={key} href={`/${key}`}>
            {startCase(key)}
          </PageMenuItem>
        ))}
      </PageMenu>
    </>
  );

  return (
    <div
      className={cx(
        "sticky top-0 left-0 w-full z-40",
        "flex justify-center",
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
