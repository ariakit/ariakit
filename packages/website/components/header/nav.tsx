import { ReactNode, memo, useMemo, useState } from "react";
import { useEvent } from "ariakit-utils/hooks";
import { cx, normalizeString } from "ariakit-utils/misc";
import { PopoverDisclosureArrow, PopoverDismiss } from "ariakit/popover";
import { VisuallyHidden } from "ariakit/visually-hidden";
import groupBy from "lodash/groupBy";
import startCase from "lodash/startCase";
import Link from "next/link";
import { useRouter } from "next/router";
import meta from "../../meta";
import button from "../../styles/button";
import tw from "../../utils/tw";
import ArrowRight from "../icons/arrow-right";
import Logo from "../logo";
import {
  PageMenu,
  PageMenuGroup,
  PageMenuItem,
  PageMenuSeparator,
} from "./page-menu";
import VersionSelect from "./version-select";

const style = {
  itemIcon: tw`
    w-4 h-4
    stroke-black/75 dark:stroke-white/75 group-active-item:stroke-current
  `,
};

const separator = <div className="opacity-30 font-semibold">/</div>;

const categoryTitles: Record<string, string> = {
  guide: "Guide",
  components: "Components",
  examples: "Examples",
  blog: "Blog",
  api: "API Reference",
};

const searchTitles: Record<string, string> = {
  guide: "Search guide",
  components: "Search components",
  examples: "Search examples",
  blog: "Search blog",
  api: "Search API",
};

type SubNavProps = {
  category?: string;
  pages: typeof meta[keyof typeof meta];
  label?: ReactNode;
  searchPlaceholder?: string;
  onSelect?: (item: SubNavProps["pages"][number]) => void;
};

function SubNav({
  category,
  label,
  searchPlaceholder,
  pages,
  onSelect,
}: SubNavProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [items, groups] = useMemo(() => {
    const normalizedSearchValue = normalizeString(searchValue).toLowerCase();
    const filteredPages = pages.filter(
      (page) =>
        normalizeString(page.title.toLowerCase()).includes(
          normalizedSearchValue
        ) ||
        normalizeString(page.description.toLowerCase()).includes(
          normalizedSearchValue
        )
    );
    const groups = groupBy(filteredPages, "group");
    const items = groups.undefined;
    delete groups.undefined;
    return [items, groups];
  }, [pages, searchValue]);

  const onSelectProp = useEvent(onSelect);

  const elements = useMemo(() => {
    if (!items && !Object.keys(groups).length) {
      return <div>No results found</div>;
    }
    return (
      <>
        {!searchValue && category && (
          <>
            <PageMenuItem
              href={`/${category}`}
              onClick={() => {
                onSelectProp();
              }}
              className="grid grid-cols-[theme(spacing.6)_auto_theme(spacing.6)]"
            >
              <span />
              <span className="text-center font-semibold">
                {categoryTitles[category]}
              </span>
              <ArrowRight className="h-6 w-6" />
            </PageMenuItem>
            <PageMenuSeparator />
          </>
        )}
        {items?.map((item, i) => (
          <PageMenuItem
            key={item.slug + i}
            value={item.slug}
            href={`/${category}/${item.slug}`}
            description={item.description}
            onClick={(event) => {
              console.log(event);
              onSelectProp(item);
            }}
            thumbnail={
              (category === "components" || category === "examples") && (
                <div className="flex items-center justify-center h-4 w-8 bg-primary-2 rounded-sm shadow-sm">
                  <div className="w-4 h-1 bg-white/75 rounded-[1px]" />
                </div>
              )
            }
          >
            {item.title}
          </PageMenuItem>
        ))}
        {Object.entries(groups).map(([group, pages]) => (
          <PageMenuGroup key={group} label={group}>
            {pages.map((item, i) => (
              <PageMenuItem
                key={item.slug + i}
                value={item.slug}
                href={`/${category}/${item.slug}`}
                description={item.description}
                onClick={() => {
                  onSelectProp(item);
                }}
                thumbnail={
                  (category === "components" || category === "examples") && (
                    <div className="flex items-center justify-center h-4 w-8 bg-primary-2 rounded-sm shadow-sm">
                      <div className="w-4 h-1 bg-white/75 rounded-[1px]" />
                    </div>
                  )
                }
              >
                {item.title}
              </PageMenuItem>
            ))}
          </PageMenuGroup>
        ))}
      </>
    );
  }, [category, items, groups, onSelectProp]);

  return (
    <PageMenu
      open={open}
      onToggle={setOpen}
      label={label}
      searchPlaceholder={searchPlaceholder}
      searchValue={searchValue}
      onSearch={setSearchValue}
      itemValue={category}
    >
      {elements}
    </PageMenu>
  );
}

export default function Nav() {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const [, category, page] = router.asPath.split("/");

  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);

  const categoryMeta = meta[category as keyof typeof meta];

  const categoryTitle = category ? categoryTitles[category] : "Browse";
  const pageMeta =
    page && categoryMeta
      ? categoryMeta.find(({ slug }) => slug === page)
      : null;

  const categoryElements = useMemo(
    () =>
      Object.keys(meta).map((key) => {
        const pages = meta[key as keyof typeof meta];
        if (!pages) return null;
        return (
          <SubNav
            key={key}
            category={key}
            label={categoryTitles[key]}
            searchPlaceholder={searchTitles[key]}
            pages={pages}
            onSelect={() => setOpen(false)}
          />
        );
      }),
    []
  );

  const element = useMemo(
    () =>
      pageMeta ? (
        <SubNav
          category={category}
          label={pageMeta.title}
          searchPlaceholder={
            searchTitles[category as keyof typeof searchTitles]
          }
          pages={meta[category as keyof typeof meta]}
          onSelect={() => setOpen(false)}
        />
      ) : null,
    [pageMeta, category]
  );

  return (
    <>
      {separator}
      <PageMenu
        open={open}
        onToggle={setOpen}
        label={categoryTitle}
        searchPlaceholder="Search"
        searchValue={searchValue}
        onSearch={setSearchValue}
        value={category || undefined}
        size="sm"
      >
        {categoryElements}
        <PageMenuSeparator />
        <PageMenuItem href="https://github.com/ariakit/ariakit">
          GitHub
        </PageMenuItem>
        <PageMenuItem href="https://github.com/ariakit/ariakit/discussions">
          Discussions
        </PageMenuItem>
        <PageMenuItem href="https://newsletter.ariakit.org">
          Newsletter
        </PageMenuItem>
      </PageMenu>
      {element && (
        <>
          {separator}
          {element}
        </>
      )}
    </>
  );

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
