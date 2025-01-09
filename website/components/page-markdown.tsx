import pagesConfig from "@/build-pages/config.js";
import { getPageContent } from "@/build-pages/get-page-content.js";
import { getPageEntryFilesCached } from "@/build-pages/get-page-entry-files.js";
import { getPageName } from "@/build-pages/get-page-name.js";
import pageIndex from "@/build-pages/index.ts";
import { getReferences } from "@/build-pages/reference-utils.js";
import type { Page, TableOfContents } from "@/build-pages/types.ts";
import { rehypeCodeMeta } from "@/lib/rehype-code-meta.ts";
import { rehypeWrapHeadings } from "@/lib/rehype-wrap-headings.ts";
import matter from "gray-matter";
import type { ReactNode } from "react";
import { Fragment } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import invariant from "tiny-invariant";
import { AuthEnabled } from "./auth.tsx";
import {
  PageA,
  PageAside,
  PageBlockquote,
  PageDiv,
  PageDivider,
  PageFigure,
  PageHeading,
  PageImage,
  PageKbd,
  PageList,
  PageListItem,
  PageParagraph,
  PageStrong,
} from "./page-elements.tsx";
import { PageHovercard, PageHovercardProvider } from "./page-hovercard.tsx";
import { PagePre } from "./page-pre.tsx";
import { PageVideo } from "./page-video.tsx";

export const getFile = (config: Page, page: string) => {
  const entryFiles = getPageEntryFilesCached(config);
  const file = config.reference
    ? [...entryFiles]
        .reverse()
        .find((file) =>
          page.replace(/^use\-/, "").startsWith(getPageName(file)),
        )
    : entryFiles.find((file) => getPageName(file) === page);
  return file;
};

export const getContent = (config: Page, file: string, page: string) => {
  const reference = config.reference
    ? getReferences(file).find((reference) => getPageName(reference) === page)
    : undefined;
  if (config.reference && !reference) return;
  return getPageContent(reference || file);
};

export interface PageMarkdownProps {
  category?: string;
  page?: string;
  section?: string;
  content?: string;
  file?: string;
  showHovercards?: boolean;
  tableOfContents?: TableOfContents;
}

export function PageMarkdown({
  category,
  page,
  content,
  file,
  showHovercards = false,
  tableOfContents,
}: PageMarkdownProps) {
  const hovercards = new Set<Promise<string | Iterable<string>>>();

  if (!content || !file) {
    invariant(category && page);
    const config = pagesConfig.pages.find((page) => page.slug === category);
    if (!config) return null;
    file = file ?? getFile(config, page);
    if (!file) return null;
    content = content ?? getContent(config, file, page);
    if (!content) return null;
  }

  const pageDetail = category
    ? pageIndex[category]?.find((item) => item.slug === page)
    : null;

  const { content: contentWithoutMatter } = matter(content);

  const Wrapper = showHovercards ? PageHovercardProvider : Fragment;

  return (
    <Wrapper>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeCodeMeta,
          rehypeRaw,
          rehypeSlug,
          rehypeWrapHeadings,
        ]}
        components={{
          h1: PageHeading,
          h2: PageHeading,
          h3: PageHeading,
          h4: PageHeading,
          hr: PageDivider,
          p: PageParagraph,
          ol: PageList,
          ul: PageList,
          li: PageListItem,
          aside: PageAside,
          figure: PageFigure,
          blockquote: PageBlockquote,
          kbd: PageKbd,
          strong: PageStrong,
          video: PageVideo,
          img: PageImage,

          pre(props) {
            return (
              <PagePre
                {...props}
                hovercards={showHovercards ? hovercards : undefined}
              />
            );
          },

          a(props) {
            return (
              <PageA
                {...props}
                category={category}
                page={page}
                file={file!}
                hovercards={showHovercards ? hovercards : undefined}
                tags={pageDetail?.tags}
              />
            );
          },

          div(props) {
            return (
              <PageDiv
                {...props}
                category={category}
                page={page}
                title={pageDetail?.title}
                tags={pageDetail?.tags}
                media={pageDetail?.media}
                tableOfContents={tableOfContents}
              />
            );
          },
        }}
      >
        {contentWithoutMatter}
      </ReactMarkdown>
      {showHovercards && <Hovercards hovercards={hovercards} />}
    </Wrapper>
  );
}

async function Hovercards({
  hovercards,
}: {
  hovercards: Set<Promise<string | Iterable<string>>>;
}) {
  const hrefs = new Set<string>();
  const maybeIterables = await Promise.all(hovercards);
  for (const maybeIterable of maybeIterables) {
    if (typeof maybeIterable === "string") {
      hrefs.add(maybeIterable);
    } else {
      for (const href of maybeIterable) {
        hrefs.add(href);
      }
    }
  }

  const contents: Record<string, ReactNode> = {};

  for (const href of hrefs) {
    const url = new URL(href, "https://ariakit.dev");
    const pathname = url.pathname;
    const [, category, page] = pathname.split("/");
    if (!page) continue;
    if (!category) continue;
    if (contents[page]) continue;
    contents[page] = (
      <PageMarkdown category={category} page={page} showHovercards={false} />
    );
  }

  return (
    <AuthEnabled>
      <PageHovercard contents={contents} />
    </AuthEnabled>
  );
}
