import { useState } from "react";
import { cx } from "ariakit-utils/misc";
import { PopoverDisclosureArrow, PopoverDismiss } from "ariakit/popover";
import { VisuallyHidden } from "ariakit/visually-hidden";
import groupBy from "lodash/groupBy";
import startCase from "lodash/startCase";
import Link from "next/link";
import { useRouter } from "next/router";
import meta from "../../meta";
import button from "../../styles/button";
import Logo from "../logo";
import { PageMenu, PageMenuGroup, PageMenuItem } from "./page-menu";
import VersionSelect from "./version-select";

const separator = <div className="opacity-30 font-semibold">/</div>;

export default function Nav() {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const [, category, page] = router.asPath.split("/");
  const [searchValue, setSearchValue] = useState("");
  const [searchValue2, setSearchValue2] = useState("");

  const breadcrumbs = category ? (
    <>
      {separator}
      <PageMenu
        searchPlaceholder="Search"
        searchValue={searchValue}
        onSearch={setSearchValue}
        value={category}
        size="sm"
      >
        {Object.keys(meta)?.map((key) => (
          <PageMenu
            key={key}
            searchPlaceholder={`Search ${key}`}
            searchValue={searchValue2}
            onSearch={setSearchValue2}
            label={startCase(key)}
            size="md"
            footer={
              <PopoverDismiss
                className={cx(
                  "grid grid-cols-[theme(spacing.14)_auto_theme(spacing.14)]",
                  "items-center h-10 p-2 w-full rounded",
                  "bg-canvas-1 dark:bg-canvas-5-dark",
                  "hover:bg-primary-1 dark:hover:bg-primary-2-dark/25",
                  "active:bg-primary-1-hover dark:active:bg-primary-2-dark-hover/25",
                  "focus-visible:ariakit-outline-input"
                )}
                onClick={() => {
                  // categorySelect.show();
                }}
              >
                <PopoverDisclosureArrow placement="left" />
                <span className="text-center">
                  {searchValue ? "Search" : "Browse"} all pages
                </span>
              </PopoverDismiss>
            }
          >
            {Object.entries(groupBy(meta[key], "group")).map(
              ([group, pages]) => (
                <PageMenuGroup key={group} label={group}>
                  {pages.map((item, i) => {
                    return (
                      <PageMenuItem
                        key={item.slug + i}
                        value={item.slug}
                        href={`/${category}/${item.slug}`}
                        description={item.description}
                        thumbnail={
                          <div className="flex items-center justify-center h-4 w-8 bg-primary-2 rounded-sm shadow-sm">
                            <div className="w-4 h-1 bg-white/75 rounded-[1px]" />
                          </div>
                        }
                      >
                        {item.title}
                      </PageMenuItem>
                    );
                  })}
                </PageMenuGroup>
              )
            )}
          </PageMenu>
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
            footer={
              <PopoverDismiss
                className={cx(
                  "grid grid-cols-[theme(spacing.14)_auto_theme(spacing.14)]",
                  "items-center h-10 p-2 w-full rounded",
                  "bg-canvas-1 dark:bg-canvas-5-dark",
                  "hover:bg-primary-1 dark:hover:bg-primary-2-dark/25",
                  "active:bg-primary-1-hover dark:active:bg-primary-2-dark-hover/25",
                  "focus-visible:ariakit-outline-input"
                )}
                onClick={() => {
                  // categorySelect.show();
                }}
              >
                <PopoverDisclosureArrow placement="left" />
                <span className="text-center">
                  {searchValue ? "Search" : "Browse"} all pages
                </span>
              </PopoverDismiss>
            }
          >
            {Object.entries(groupBy(meta[category], "group")).map(
              ([group, pages]) => (
                <PageMenuGroup key={group} label={group}>
                  {pages.map((item, i) => {
                    return (
                      <PageMenuItem
                        key={item.slug + i}
                        value={item.slug}
                        href={`/${category}/${item.slug}`}
                        description={item.description}
                        thumbnail={
                          <div className="flex items-center justify-center h-4 w-8 bg-primary-2 rounded-sm shadow-sm">
                            <div className="w-4 h-1 bg-white/75 rounded-[1px]" />
                          </div>
                        }
                      >
                        {item.title}
                      </PageMenuItem>
                    );
                  })}
                </PageMenuGroup>
              )
            )}
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
