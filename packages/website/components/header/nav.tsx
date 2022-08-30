import {
  ReactNode,
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import { useEvent, useSafeLayoutEffect } from "ariakit-utils/hooks";
import { cx, normalizeString } from "ariakit-utils/misc";
import { isApple } from "ariakit-utils/platform";
import { PopoverDisclosureArrow, PopoverDismiss } from "ariakit/popover";
import groupBy from "lodash/groupBy";
import { useRouter } from "next/router";
import { PageContent } from "../../pages.contents";
import pageIndex, { PageIndexDetail } from "../../pages.index";
import tw from "../../utils/tw";
import Blog from "../icons/blog";
import Components from "../icons/components";
import Examples from "../icons/examples";
import Guide from "../icons/guide";
import {
  PageMenu,
  PageMenuGroup,
  PageMenuItem,
  PageMenuSeparator,
} from "./page-menu";

type Data = Array<
  PageContent & { keywords: string[]; score?: number; key?: string }
>;

type SearchData = Array<Data[number] & { nested?: boolean }>;

const style = {
  thumbnail: tw`
    w-7 h-7
    fill-primary-2-foreground dark:fill-primary-2-dark-foreground
  `,
};

const separator = <div className="font-semibold opacity-30">/</div>;

const thumbnails: Record<string, ReactNode> = {
  guide: <Guide className={style.thumbnail} />,
  components: <Components className={style.thumbnail} />,
  examples: <Examples className={style.thumbnail} />,
  blog: <Blog className={style.thumbnail} />,
};

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

function getItemKey(item: PageIndexDetail | SearchData[number], index: number) {
  const category = "category" in item ? item.category : "";
  const section = "section" in item ? item.section : "";
  return category + item.slug + section + index;
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

function highlightValue(
  itemValue: string | null | undefined,
  userValues: string[]
) {
  if (!itemValue) return itemValue;
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

function Shortcut() {
  const [platform, setPlatform] = useState<"mac" | "pc" | null>(null);
  useSafeLayoutEffect(() => {
    setPlatform(isApple() ? "mac" : "pc");
  }, []);
  if (!platform) return null;
  return (
    <span className="mx-1 flex gap-0.5 justify-self-end text-black/[62.5%] dark:text-white/70">
      {platform === "mac" ? (
        <abbr title="Command" className="no-underline">
          ⌘
        </abbr>
      ) : (
        <abbr title="Control" className="no-underline">
          Ctrl
        </abbr>
      )}
      <span className={cx(platform !== "mac" && "font-bold")}>K</span>
    </span>
  );
}

type NavItemProps = {
  item: PageIndexDetail | SearchData[number];
  category?: string;
  onClick?: () => void;
};

const NavItem = memo(({ item, category, onClick }: NavItemProps) => {
  category = category || ("category" in item ? item.category : undefined);
  if (!category) return null;
  const id = "id" in item ? item.id : null;
  const keywords = "keywords" in item ? item.keywords : null;
  const section = "section" in item ? item.section : null;
  const parentSection = "parentSection" in item ? item.parentSection : null;
  const nested = "nested" in item ? item.nested : false;
  const href = `/${category}/${item.slug}${id ? `#${id}` : ""}`;
  const description = keywords
    ? highlightValue(item.content, keywords)
    : item.content;
  const path = keywords
    ? [
        highlightValue(categoryTitles[category], keywords),
        highlightValue(item.group, keywords),
        section && highlightValue(item.title, keywords),
        highlightValue(parentSection, keywords),
        !nested && highlightValue(section, keywords),
      ]
    : undefined;
  return (
    <PageMenuItem
      title={nested ? section || item.title : item.title}
      description={description}
      value={item.slug}
      href={href}
      path={path}
      nested={nested}
      thumbnail={thumbnails[category]}
      onClick={onClick}
    />
  );
});

type NavMenuProps = {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  category?: string;
  label?: ReactNode;
  value?: string;
  footer?: boolean;
  shortcut?: boolean;
  children?: ReactNode;
  searchValue?: string;
  onBrowseAllPages?: (value: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
};

const NavMenuContext = createContext(false);

const NavMenu = memo(
  ({
    open: openProp,
    setOpen: setOpenProp,
    category,
    label,
    value,
    footer,
    shortcut,
    children,
    searchValue: searchValueProp,
    onBrowseAllPages,
    size = "lg",
  }: NavMenuProps) => {
    const isSubNav = useContext(NavMenuContext);
    const [_open, _setOpen] = useState(false);
    const open = openProp ?? _open;
    const setOpen = setOpenProp ?? _setOpen;
    const [searchValue, setSearchValue] = useState("");

    if (!open && searchValue) {
      setSearchValue("");
    }

    useEffect(() => {
      console.log(searchValueProp);
      if (searchValueProp) {
        setSearchValue(searchValueProp);
      }
    }, [searchValueProp]);

    const url = `/api/search?q=${searchValue}${
      category ? `&category=${category}` : ""
    }`;
    const options = {
      staleTime: Infinity,
      enabled: open && !!searchValue,
      keepPreviousData: open && !!searchValue,
    };
    const { data } = useQuery<Data>([url], queryFetch, options);

    const searchData = useMemo(() => data && parseSearchData(data), [data]);
    const noResults = !!searchData && !searchData.length;
    const pages = category ? pageIndex[category] : null;

    const [items, groups] = useMemo(() => {
      if (searchData) return [searchData, {}];
      if (!pages) return [[], {}];
      const groups = groupBy(pages, "group");
      const items = groups.null || [];
      delete groups.null;
      return [items, groups];
    }, [searchData, pages]);

    const itemElements = useMemo(() => {
      if (noResults) return null;
      if (!items.length && !Object.keys(groups).length) return null;
      return (
        <>
          {items?.map((item, i) => (
            <NavItem
              key={getItemKey(item, i)}
              category={category}
              item={item}
            />
          ))}
          {Object.entries(groups).map(([group, pages]) => (
            <PageMenuGroup key={group} label={group}>
              {pages.map((item, i) => (
                <NavItem
                  key={getItemKey(item, i)}
                  category={category}
                  item={item}
                />
              ))}
            </PageMenuGroup>
          ))}
        </>
      );
    }, [noResults, items, groups, category]);

    const categoryTitle = category ? categoryTitles[category] : null;

    return (
      <NavMenuContext.Provider value={true}>
        <PageMenu
          open={open}
          onToggle={setOpen}
          label={
            <>
              {label}
              {shortcut && <Shortcut />}
            </>
          }
          searchPlaceholder={category ? searchTitles[category] : "Search"}
          searchValue={searchValue}
          onSearch={setSearchValue}
          itemValue={category}
          value={value}
          size={searchData?.length ? "xl" : size}
          autoSelect={!!searchData?.length}
          footer={
            !isSubNav &&
            footer && (
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
                  onBrowseAllPages?.(searchValue);
                }}
              >
                <PopoverDisclosureArrow placement="left" />
                <span className="text-center">
                  {searchValue ? "Search" : "Browse"} all pages
                </span>
                <Shortcut />
              </PopoverDismiss>
            )
          }
        >
          {category && !searchData?.length && (
            <>
              <PageMenuItem
                value={category}
                href={`/${category}`}
                className="justify-center font-semibold"
              >
                {categoryTitle}
              </PageMenuItem>
              <PageMenuSeparator />
            </>
          )}
          {itemElements || children}
        </PageMenu>
      </NavMenuContext.Provider>
    );
  }
);

export default function Nav() {
  const router = useRouter();
  const [, category, page] = router.pathname.split("/");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [pageOpen, setPageOpen] = useState(false);
  const [categorySearchValue, setCategorySearchValue] = useState<string>();

  useEffect(() => {
    if (categorySearchValue) {
      setCategorySearchValue(undefined);
    }
  }, [categorySearchValue]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
        if (categoryOpen) {
          setPageOpen(true);
        } else if (pageOpen) {
          setCategoryOpen(true);
        } else if (page) {
          setPageOpen(true);
        } else {
          setCategoryOpen(true);
        }
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [categoryOpen, pageOpen, page]);

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
        return <NavMenu key={key} category={key} label={categoryTitles[key]} />;
      }),
    []
  );

  const children = useMemo(
    () => (
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
    ),
    [categoryElements]
  );

  const element = !!pageMeta && !!category;

  const onBrowseAllPages = useEvent((value: string) => {
    setCategorySearchValue(value);
    setCategoryOpen(true);
  });

  return (
    <>
      {separator}
      <NavMenu
        key={element ? "category" : "page"}
        open={categoryOpen}
        setOpen={setCategoryOpen}
        shortcut={!element}
        label={categoryTitle}
        searchValue={categorySearchValue}
        value={category || undefined}
        size="sm"
      >
        {children}
      </NavMenu>
      {element && separator}
      {element && (
        <NavMenu
          key="page"
          open={pageOpen}
          setOpen={setPageOpen}
          category={category}
          footer
          shortcut
          onBrowseAllPages={onBrowseAllPages}
          label={pageMeta.title}
          value={page}
        />
      )}
    </>
  );
}
