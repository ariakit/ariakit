import { getChangelogFile } from "build-pages/changelog.js";
import { getPageContent } from "build-pages/get-page-content.js";
import { getPageTreeFromContent } from "build-pages/get-page-tree.js";
import type { TableOfContents } from "build-pages/types.js";
import { PageMarkdown } from "components/page-markdown.jsx";
import { PageSidebar } from "components/page-sidebar.jsx";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";

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
      children: tableOfContentsChildren?.map(({ children, ...item }) => item),
    },
  ];
  return (
    <div className="flex flex-col items-start justify-center md:flex-row-reverse">
      <PageSidebar tableOfContents={tableOfContents} />
      <main className="relative flex w-full min-w-[1px] max-w-5xl flex-col items-center gap-8 px-3 md:mt-12 md:px-4 lg:px-8">
        <PageMarkdown file={file} content={content} />
      </main>
    </div>
  );
}
