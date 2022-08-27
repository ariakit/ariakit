import {
  ButtonHTMLAttributes,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import { useEvent } from "ariakit-utils/hooks";
import { cx, normalizeString } from "ariakit-utils/misc";
import { PopoverDisclosureArrow, PopoverDismiss } from "ariakit/popover";
import { VisuallyHidden } from "ariakit/visually-hidden";
import groupBy from "lodash/groupBy";
import startCase from "lodash/startCase";
import Link from "next/link";
import { useRouter } from "next/router";
import { PageContent } from "../../pages.contents";
import pageIndex from "../../pages.index";
import button from "../../styles/button";
import tw from "../../utils/tw";
import ArrowRight from "../icons/arrow-right";
import Blog from "../icons/blog";
import Components from "../icons/components";
import Examples from "../icons/examples";
import Guide from "../icons/guide";
import Logo from "../logo";
import {
  PageMenu,
  PageMenuGroup,
  PageMenuItem,
  PageMenuSeparator,
} from "./page-menu";
import VersionSelect from "./version-select";

type Data = Array<
  PageContent & {
    keywords: string[];
    score?: number;
    key?: string;
  }
>;

type SearchData = Array<
  Data[number] & {
    nested?: boolean;
  }
>;

const style = {
  thumbnail: tw`w-7 h-7 fill-primary-2-foreground dark:fill-primary-2-dark-foreground`,
};

const thumbnails = {
  guide: <Guide className={style.thumbnail} />,
  components: <Components className={style.thumbnail} />,
  examples: <Examples className={style.thumbnail} />,
  blog: <Blog className={style.thumbnail} />,
};

const separator = <div className="font-semibold opacity-30">/</div>;

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

function getSearchParentPageData(items: Data): SearchData[number] | null {
  const parentPage = items?.find((item) => !item.section);
  if (parentPage) return parentPage;
  if (items.length <= 1) return null;
  const { category, slug } = items[0]!;
  if (!category) return null;
  if (!slug) return null;
  const page = pageIndex[category]?.find((item) => item.slug === slug);
  if (!page) return null;
  return {
    ...page,
    id: null,
    section: null,
    parentSection: null,
    category,
    keywords: [],
  };
}

function parseSearchData(data: Data) {
  const dataBySlug = groupBy(data, "slug");
  const searchData: SearchData = [];
  const slugs = Object.keys(dataBySlug);
  slugs.forEach((slug) => {
    const items = dataBySlug[slug];
    if (!items) return;
    const parentPage = getSearchParentPageData(items);
    if (parentPage) {
      searchData.push(parentPage);
    }
    const itemsWithoutParentPage = items.filter((item) => item !== parentPage);
    searchData.push(
      ...itemsWithoutParentPage
        .slice(0, parentPage ? 3 : undefined)
        .map((item) => ({ ...item, nested: !!parentPage }))
    );
  });
  return searchData;
}

function normalizeValue(value: string) {
  return normalizeString(value).toLowerCase();
}

function getUserValueIndex(itemValue: string, userValues: string[]) {
  return userValues.reduce<[number, string]>(
    ([index, prevUserValue], userValue) => {
      if (index !== -1) {
        return [index, prevUserValue];
      }
      return [normalizeValue(itemValue).indexOf(userValue), userValue];
    },
    [-1, ""]
  );
}

function highlightValue(itemValue: string, userValues: string[]) {
  userValues = userValues.filter(Boolean).map(normalizeValue);
  const parts: JSX.Element[] = [];
  const wrap = (value: string, autocomplete = false) => (
    <span
      key={parts.length}
      data-autocomplete-value={autocomplete ? "" : undefined}
      data-user-value={autocomplete ? undefined : ""}
    >
      {value}
    </span>
  );
  let [index, userValue] = getUserValueIndex(itemValue, userValues);
  while (index !== -1) {
    if (index !== 0) {
      parts.push(wrap(itemValue.slice(0, index), true));
    }
    parts.push(wrap(itemValue.slice(index, index + userValue.length)));
    itemValue = itemValue.slice(index + userValue.length);
    [index, userValue] = getUserValueIndex(itemValue, userValues);
  }
  if (itemValue) {
    parts.push(wrap(itemValue, true));
  }
  return parts;
}

function queryFetch({ queryKey, signal }: QueryFunctionContext) {
  const [url] = queryKey as [string];
  return fetch(url, { signal }).then((response) => response.json());
}

type SubNavProps = {
  category?: string;
  pages: typeof pageIndex[keyof typeof pageIndex];
  label?: ReactNode;
  searchPlaceholder?: string;
  onSelect?: (item: SubNavProps["pages"][number]) => void;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

function SubNav({
  category,
  label,
  searchPlaceholder,
  pages,
  onSelect,
  onClick,
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
        normalizeString(page.content.toLowerCase()).includes(
          normalizedSearchValue
        )
    );
    const groups = groupBy(filteredPages, "group");
    const items = groups.null;
    delete groups.null;
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
            description={item.content}
            onClick={(event) => {
              console.log(event);
              onSelectProp(item);
            }}
            thumbnail={
              (category === "components" || category === "examples") && (
                <div className="flex h-4 w-8 items-center justify-center rounded-sm bg-primary-2 shadow-sm">
                  <div className="h-1 w-4 rounded-[1px] bg-white/75" />
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
                description={item.content}
                onClick={() => {
                  onSelectProp(item);
                }}
                thumbnail={
                  (category === "components" || category === "examples") && (
                    <div className="flex h-4 w-8 items-center justify-center rounded-sm bg-primary-2 shadow-sm">
                      <div className="h-1 w-4 rounded-[1px] bg-white/75" />
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
      onClick={onClick}
    >
      {elements}
    </PageMenu>
  );
}

export default function Nav() {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const [, category, page] = router.pathname.split("/");

  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const url = `/api/search?q=${searchValue}`;
  const { data, isFetching } = useQuery<Data>([url], queryFetch, {
    staleTime: Infinity,
    enabled: open,
    keepPreviousData: true,
  });
  const ref = useRef<HTMLButtonElement>(null);

  if (!open && searchValue) {
    setSearchValue("");
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const categoryMeta = pageIndex[category as keyof typeof pageIndex];

  const categoryTitle = category ? categoryTitles[category] : "Browse";
  const pageMeta =
    page && categoryMeta
      ? categoryMeta.find(({ slug }) => slug === page)
      : null;

  const categoryElements = useMemo(
    () =>
      Object.keys(pageIndex).map((key) => {
        const pages = pageIndex[key as keyof typeof pageIndex];
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

  const command = (
    <span className="mx-1 flex gap-0.5 text-black/[62.5%] dark:text-white/70">
      {true ? (
        <abbr title="Command" className="no-underline">
          ⌘
        </abbr>
      ) : (
        <abbr title="Control" className="no-underline">
          Ctrl
        </abbr>
      )}
      <span className={cx(!true && "font-bold")}>K</span>
    </span>
  );

  const element = useMemo(
    () =>
      pageMeta && categoryMeta ? (
        <SubNav
          category={category}
          label={
            <>
              {pageMeta.title}
              {command}
            </>
          }
          searchPlaceholder={
            searchTitles[category as keyof typeof searchTitles]
          }
          pages={categoryMeta}
          onSelect={() => setOpen(false)}
        />
      ) : null,
    [pageMeta, category, categoryMeta]
  );

  const results = useMemo(() => {
    if (!data?.length) return null;
    const nextData = parseSearchData(data);
    const renderItem = (item, i) => (
      <PageMenuItem
        key={item.title + i}
        value={item.slug}
        href={`/${item.category}/${item.slug}${item.id ? `#${item.id}` : ""}`}
        path={[
          categoryTitles[item.category] &&
            highlightValue(categoryTitles[item.category], item.keywords),
          item.group && highlightValue(item.group, item.keywords),
          item.section &&
            item.title &&
            highlightValue(item.title, item.keywords),
          item.parentSection &&
            highlightValue(item.parentSection, item.keywords),
          !item.nested &&
            item.section &&
            highlightValue(item.section, item.keywords),
        ]}
        nested={item.nested}
        description={highlightValue(item.content, item.keywords)}
        title={item.nested ? item.section || item.title : item.title}
        thumbnail={
          thumbnails[item.category] || (
            <div className="h-6 w-6 rounded-full bg-primary-2" />
          )
        }
      />
    );
    return <>{nextData.map(renderItem)}</>;
  }, [data]);

  return (
    <>
      {separator}
      <PageMenu
        ref={ref}
        open={open}
        onToggle={setOpen}
        label={
          element ? (
            categoryTitle
          ) : (
            <>
              {categoryTitle}
              {command}
            </>
          )
        }
        searchPlaceholder="Search"
        searchValue={searchValue}
        onSearch={setSearchValue}
        autoSelect={!!data?.length}
        value={category || undefined}
        size={data?.length ? "xl" : "sm"}
      >
        {searchValue.length && !!data?.length ? (
          results
        ) : searchValue.length && !data?.length && !isFetching ? (
          <div>No results for &ldquo;{searchValue}&rdquo;</div>
        ) : (
          <>
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
          </>
        )}
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
        {Object.keys(pageIndex)?.map((key) => (
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
                  "h-10 w-full items-center rounded p-2",
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
            {Object.entries(groupBy(pageIndex[key], "group")).map(
              ([group, pages]) => (
                <PageMenuGroup key={group} label={group}>
                  {pages.map((item, i) => {
                    return (
                      <PageMenuItem
                        key={item.slug + i}
                        value={item.slug}
                        href={`/${category}/${item.slug}`}
                        description={item.content}
                        thumbnail={
                          <div className="flex h-4 w-8 items-center justify-center rounded-sm bg-primary-2 shadow-sm">
                            <div className="h-1 w-4 rounded-[1px] bg-white/75" />
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
                  "h-10 w-full items-center rounded p-2",
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
            {Object.entries(groupBy(pageIndex[category], "group")).map(
              ([group, pages]) => (
                <PageMenuGroup key={group} label={group}>
                  {pages.map((item, i) => {
                    return (
                      <PageMenuItem
                        key={item.slug + i}
                        value={item.slug}
                        href={`/${category}/${item.slug}`}
                        description={item.content}
                        thumbnail={
                          <div className="flex h-4 w-8 items-center justify-center rounded-sm bg-primary-2 shadow-sm">
                            <div className="h-1 w-4 rounded-[1px] bg-white/75" />
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
        {Object.keys(pageIndex)?.map((key) => (
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
