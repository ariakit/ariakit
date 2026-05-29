import { notFound } from "next/navigation.js";
import pagesConfig from "@/build-pages/config.js";
import { getPageEntryFilesCached } from "@/build-pages/get-page-entry-files.js";
import { getPageName } from "@/build-pages/get-page-name.js";
import { getPageTreeFromContent } from "@/build-pages/get-page-tree.js";
import pageIndex from "@/build-pages/index.ts";
import { getReferences } from "@/build-pages/reference-utils.js";
import type {
  Page,
  TableOfContents as TableOfContentsData,
} from "@/build-pages/types.ts";
import {
  getContent,
  getFile,
  PageMarkdown,
} from "@/components/page-markdown.tsx";
import { getNextPageMetadata } from "@/lib/get-next-page-metadata.ts";

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

  for (const page of referencePages) {
    const entryFiles = getPageEntryFilesCached(page);
    const category = page.slug;
    const references = entryFiles.flatMap((file) => getReferences(file));
    for (const reference of references) {
      const page = getPageName(reference);
      params.push({ category, page });
    }
  }

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

export default async function ContentPage({ params }: PageProps) {
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
      href: "#",
      text: pageDetail?.title ?? page,
    },
    ...tableOfContentsData,
  ];

  return (
    <main className="relative mt-12 flex w-full min-w-[1px] flex-col items-center gap-8 px-[--page-padding] md:mt-20">
      <PageMarkdown
        tableOfContents={tableOfContents}
        category={category}
        page={page}
      />
    </main>
  );
}
