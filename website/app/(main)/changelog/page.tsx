import { getChangelogFile } from "build-pages/changelog.ts";
import { getPageContent } from "build-pages/get-page-content.js";
import { getPageTreeFromContent } from "build-pages/get-page-tree.js";
import type { TableOfContents } from "build-pages/types.ts";
import { PageMarkdown } from "components/page-markdown.tsx";
import { getNextPageMetadata } from "utils/get-next-page-metadata.ts";

export function generateMetadata() {
  return getNextPageMetadata({ title: `Changelog - Ariakit` });
}

export default function Page() {
  const file = getChangelogFile();
  const content = getPageContent(file).replace(
    "# @ariakit/react",
    "# Changelog",
  );
  const tree = getPageTreeFromContent(content);

  const tableOfContentsChildren = tree.data?.tableOfContents as
    | TableOfContents
    | undefined;

  const tableOfContents: TableOfContents = [
    {
      id: "",
      href: "#",
      text: "Changelog",
    },
    ...(tableOfContentsChildren?.map(({ children, ...item }) => item) || []),
  ];
  return (
    <main className="relative mt-12 flex w-full min-w-[1px] flex-col items-center gap-8 px-3 md:mt-16 md:px-4 lg:px-8">
      <PageMarkdown
        file={file}
        content={content}
        tableOfContents={tableOfContents}
      />
    </main>
  );
}
