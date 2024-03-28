import pagesConfig from "build-pages/config.js";
import { getPageEntryFilesCached } from "build-pages/get-page-entry-files.js";
import { getPageName } from "build-pages/get-page-name.js";
import { getPageTreeFromContent } from "build-pages/get-page-tree.js";
import pageIndex from "build-pages/index.ts";
import { getReferences } from "build-pages/reference-utils.js";
import type {
  Page,
  TableOfContents as TableOfContentsData,
} from "build-pages/types.ts";
import {
  PageMarkdown,
  getContent,
  getFile,
} from "components/page-markdown.tsx";
import { PageSidebar } from "components/page-sidebar.tsx";
import { PlusBordered } from "components/plus-bordered.tsx";
import Link from "next/link.js";
import { notFound } from "next/navigation.js";
import { twJoin } from "tailwind-merge";
import { getNextPageMetadata } from "utils/get-next-page-metadata.ts";
import { getPageIcon } from "utils/get-page-icon.tsx";

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

  const isNextPagePlus = nextPage?.tags.includes("Plus");

  const nextPageLink = nextPage && (
    <Link
      href={`/${nextPage.category}/${nextPage.slug}`}
      className="group flex w-auto items-center gap-3 rounded-lg p-2 pr-4 active:bg-blue-200/70 focus-visible:ariakit-outline-input dark:active:!bg-blue-800/25 md:ml-3 [@media(any-hover:hover)]:hover:bg-blue-200/40 [@media(any-hover:hover)]:dark:hover:bg-blue-600/25"
    >
      <PlusBordered
        plus={isNextPagePlus}
        className={twJoin(
          "flex h-14 w-14 items-center justify-center overflow-hidden rounded bg-gray-150 dark:bg-gray-850",
          !isNextPagePlus &&
            "group-hover:bg-black/[7.5%] dark:group-hover:bg-black/45",
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

  return (
    <div className="flex flex-col items-start justify-center md:flex-row-reverse">
      <PageSidebar tableOfContents={tableOfContents}>
        {nextPageLink}
      </PageSidebar>
      <main className="relative flex w-full min-w-[1px] max-w-5xl flex-col items-center gap-8 px-3 md:mt-12 md:px-4 lg:px-8">
        <PageMarkdown
          tableOfContents={tableOfContentsData}
          category={category}
          page={page}
        />
      </main>
    </div>
  );
}
