import pagesConfig from "build-pages/config.js";
import { getPageEntryFilesCached } from "build-pages/get-page-entry-files.js";
import { getPageName } from "build-pages/get-page-name.js";
import { getPageTitle } from "build-pages/get-page-title.js";
import { getPageTreeFromContent } from "build-pages/get-page-tree.js";
import pageIndex from "build-pages/index.js";
import { getReferences } from "build-pages/reference-utils.js";
import type {
  Page,
  TableOfContents as TableOfContentsData,
} from "build-pages/types.js";
import { NewsletterForm } from "components/newsletter-form.jsx";
import {
  PageMarkdown,
  getContent,
  getFile,
} from "components/page-markdown.jsx";
import { PlusBordered } from "components/plus-bordered.jsx";
import { ChevronRight } from "icons/chevron-right.jsx";
import { Document } from "icons/document.jsx";
import { FolderOpen } from "icons/folder-open.jsx";
import { NewWindow } from "icons/new-window.js";
import Link from "next/link.js";
import { notFound } from "next/navigation.js";
import { twJoin } from "tailwind-merge";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";
import { getPageIcon } from "utils/get-page-icon.jsx";
import { TableOfContents } from "./table-of-contents.js";

const { pages } = pagesConfig;

function getPageNames(page: Page) {
  return getPageEntryFilesCached(page).map(getPageName);
}

export function generateStaticParams() {
  const referencePages = pages.filter((page) => page.reference);
  const otherPages = pages.filter((page) => !page.reference);
  const params = otherPages.flatMap((page) => {
    const pages = getPageNames(page);
    const category = page.slug;
    return pages.map((page) => ({ category, page }));
  });

  referencePages.forEach((page) => {
    const entryFiles = getPageEntryFilesCached(page);
    const category = page.slug;
    const references = entryFiles.flatMap((file) => getReferences(file));
    references.forEach((reference) => {
      const page = getPageName(reference);
      params.push({ category, page });
    });
  });

  return params;
}

interface PageProps {
  params: ReturnType<typeof generateStaticParams>[number];
}

export async function generateMetadata({ params }: PageProps) {
  const { category, page } = params;
  const data = pageIndex[category]?.find((item) => item.slug === page);

  if (!data) {
    // Pages without a readme.md file
    return getNextPageMetadata({
      title: `${page} - Ariakit`,
      index: false,
    });
  }

  return getNextPageMetadata({
    title: `${data.title} - Ariakit`,
    description: data.content,
  });
}

export default async function Page({ params }: PageProps) {
  const { category, page } = params;

  const config = pages.find((page) => page.slug === category);
  if (!config) return notFound();

  const file = getFile(config, page);
  if (!file) return notFound();

  const content = getContent(config, file, page);
  if (!content) return notFound();

  const tree = getPageTreeFromContent(content);
  const pageDetail = pageIndex[category]?.find((item) => item.slug === page);
  const categoryDetail = pagesConfig.pages.find(
    (item) => item.slug === category,
  );

  if (!categoryDetail) return notFound();

  const tableOfContentsData = tree.data?.tableOfContents as TableOfContentsData;
  const tableOfContents: TableOfContentsData = [
    {
      id: "",
      href: `/${category}`,
      text: categoryDetail.title,
    },
    {
      id: "",
      href: "#",
      text: pageDetail?.title ?? page,
      children: tableOfContentsData,
    },
  ];

  const getTableOfContentsIds = (data: TableOfContentsData): string[] => {
    return [...data].reverse().flatMap((item) => {
      if (item.children) {
        return [...getTableOfContentsIds(item.children), item.id];
      }
      if (item.id) {
        return item.id;
      }
      return [];
    });
  };

  const renderTableOfContents = (data: TableOfContentsData, depth = 0) =>
    data.map((item) => {
      const isFolder = !item.id && item.href.split("/").length === 2;
      const Component = item.id || !isFolder ? "a" : Link;
      const isPage = !isFolder && !item.id;
      const Icon = isFolder ? FolderOpen : isPage ? Document : null;
      const icon = Icon ? (
        <Icon className="h-5 w-5 flex-none translate-y-px opacity-60 group-aria-[current]:opacity-100 md:h-4 md:w-4" />
      ) : null;
      return (
        <li key={item.href} className="flex flex-col">
          <Component
            href={item.href}
            data-depth={depth}
            aria-current={isPage ? "true" : undefined}
            className={twJoin(
              "group relative flex items-start gap-2 rounded py-1.5 pr-4 md:gap-1",
              "aria-[current]:bg-blue-200/40 dark:aria-[current]:bg-blue-600/25",
              "underline-offset-[0.2em] hover:text-black dark:hover:text-white",
              "scroll-my-2 focus-visible:ariakit-outline-input",
              `data-[depth="0"]:scroll-mt-96`,
              `data-[depth="0"]:pl-2 data-[depth="1"]:pl-9 data-[depth="2"]:pl-9 data-[depth="3"]:pl-24`,
              `md:data-[depth="0"]:pl-1 md:data-[depth="1"]:pl-6 md:data-[depth="2"]:pl-6 md:data-[depth="3"]:pl-12`,
            )}
          >
            <span className="absolute -left-4 top-0 hidden h-full w-2 rounded-r bg-blue-600 group-aria-[current]:block" />
            {icon}
            <span className="flex gap-[2px] group-aria-[current]:text-black dark:group-aria-[current]:text-white [@media(any-hover:hover)]:group-hover:underline">
              {depth > 1 && (
                <ChevronRight className="h-3.5 w-3.5 flex-none -translate-x-[2px] translate-y-[4.5px] opacity-60 md:translate-y-[3px]" />
              )}
              {item.text}
            </span>
          </Component>
          {item.children && (
            <ul className="flex flex-col">
              {renderTableOfContents(item.children, depth + 1)}
            </ul>
          )}
        </li>
      );
    });

  const sortedIndex = Object.values(pageIndex).flatMap((item) =>
    [...item].sort((a, b) => {
      if (a.group === b.group) return 0;
      if (!a.group && b.group) return -1;
      if (a.group && !b.group) return 1;
      if (!a.group || !b.group) return 0;
      return a.group > b.group ? 1 : -1;
    }),
  );

  let index = pageDetail && sortedIndex ? sortedIndex.indexOf(pageDetail) : -1;
  let nextPage = index !== -1 ? sortedIndex?.[index + 1] : undefined;

  while (nextPage?.unlisted || nextPage?.group === "Other") {
    index += 1;
    nextPage = sortedIndex?.[index + 1];
  }

  const isNextPageNew = nextPage?.tags.includes("New");

  const nextPageLink = nextPage && (
    <Link
      href={`/${nextPage.category}/${nextPage.slug}`}
      className="group flex w-auto items-center gap-3 rounded-lg p-2 pr-4 active:bg-blue-200/70 focus-visible:ariakit-outline-input md:ml-3 dark:active:!bg-blue-800/25 [@media(any-hover:hover)]:hover:bg-blue-200/40 [@media(any-hover:hover)]:dark:hover:bg-blue-600/25"
    >
      <PlusBordered
        plus={isNextPageNew}
        className={twJoin(
          "flex h-14 w-14 items-center justify-center overflow-hidden rounded bg-gray-150 dark:bg-gray-850",
          !isNextPageNew &&
            "group-hover:bg-black/[7.5%] dark:group-hover:bg-black/80",
        )}
      >
        {getPageIcon(nextPage.category, nextPage.slug) || <span />}
      </PlusBordered>
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden text-sm">
        <div className="font-semibold">Up Next</div>
        <div className="truncate opacity-60">{nextPage.title}</div>
      </div>
    </Link>
  );

  const navList = (
    <ul className="flex flex-col p-2 text-black/90 md:p-0 md:text-sm md:text-black/80 dark:text-white/80 md:dark:text-white/70">
      {renderTableOfContents(tableOfContents)}
    </ul>
  );

  return (
    <div className="flex flex-col items-start justify-center md:flex-row-reverse">
      <TableOfContents
        ids={getTableOfContentsIds(tableOfContents)}
        popoverContents={
          <div className="flex flex-col gap-4">
            {navList}
            {nextPageLink}
          </div>
        }
      >
        <div className="sticky top-32 m-4 hidden h-screen max-h-[calc(100vh-theme(spacing.36))] w-60 flex-none flex-col gap-8 border-l border-black/10 md:flex dark:border-white/10">
          <nav className="w-full flex-1 flex-col gap-4 overflow-auto p-3 pr-1">
            {navList}
          </nav>
          {nextPageLink}
        </div>
      </TableOfContents>
      <main className="relative flex w-full min-w-[1px] max-w-5xl flex-col items-center gap-8 px-3 md:mt-12 md:px-4 lg:px-8">
        <PageMarkdown
          tableOfContents={tableOfContentsData}
          category={category}
          page={page}
        />
        <div className="mt-20 grid w-full max-w-[832px] grid-cols-1 justify-between gap-4 rounded-lg bg-gradient-to-br from-blue-50 to-pink-50 p-4 sm:grid-cols-2 sm:gap-8 sm:rounded-xl sm:p-8 dark:from-blue-600/30 dark:to-pink-600/10">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium sm:text-2xl">Follow updates</h2>
            <p className="text-black/80 dark:font-light dark:text-white/80">
              Join 1,000+ subscribers and receive monthly updates with the
              latest improvements on{" "}
              <strong className="font-semibold text-black dark:text-white">
                {getPageTitle(category, true)}
              </strong>
              .
            </p>
            <p>
              <a
                href="https://newsletter.ariakit.org/latest"
                target="_blank"
                className="relative -mb-1.5 -mt-1 rounded-sm pb-1.5 pt-1 font-medium text-blue-700 underline decoration-1 underline-offset-[0.25em] [text-decoration-skip-ink:none] hover:decoration-[3px] focus-visible:no-underline focus-visible:ariakit-outline-input dark:font-normal dark:text-blue-400 [&>code]:text-blue-900 [&>code]:dark:text-blue-300"
                rel="noreferrer"
              >
                Read latest issue
                <NewWindow className="mb-0.5 ml-0.5 inline h-[1em] w-[1em] stroke-black/60 dark:stroke-white/60" />
              </a>
            </p>
          </div>
          <NewsletterForm location="page" className="mt-4 flex flex-col gap-3">
            <div className="flex gap-3 sm:flex-col sm:gap-4">
              <input
                className="h-10 w-full flex-1 rounded border-none bg-white px-4 text-black placeholder-black/60 focus-visible:ariakit-outline-input sm:h-12 sm:flex-none sm:px-5 sm:text-lg"
                type="email"
                name="email"
                required
                placeholder="Your email address"
              />
              <button className="h-10 !cursor-pointer whitespace-nowrap rounded bg-blue-600 px-4 text-white shadow-xl hover:bg-blue-800 focus-visible:ariakit-outline sm:h-12 sm:px-5 sm:text-lg">
                Subscribe
              </button>
            </div>
            <p className="text-sm opacity-70 sm:text-center">
              No Spam. Unsubscribe at any time.
            </p>
          </NewsletterForm>
        </div>
      </main>
    </div>
  );
}
