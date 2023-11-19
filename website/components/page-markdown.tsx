import { Fragment, cache } from "react";
import type { ReactNode } from "react";
import pagesConfig from "build-pages/config.js";
import { getPageContent } from "build-pages/get-page-content.js";
import { getPageEntryFilesCached } from "build-pages/get-page-entry-files.js";
import { getPageName } from "build-pages/get-page-name.js";
import pageIndex from "build-pages/index.js";
import { getReferences } from "build-pages/reference-utils.js";
import type { Page } from "build-pages/types.js";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { rehypeCodeMeta } from "utils/rehype-code-meta.js";
import { rehypeWrapHeadings } from "utils/rehype-wrap-headings.js";
import { AuthEnabled } from "./auth.jsx";
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
} from "./page-elements.jsx";
import { PageHovercard, PageHovercardProvider } from "./page-hovercard.jsx";
import { PagePre } from "./page-pre.jsx";
import { PageVideo } from "./page-video.jsx";

export const getFile = cache((config: Page, page: string) => {
  const entryFiles = getPageEntryFilesCached(config);
  const file = config.reference
    ? [...entryFiles]
        .reverse()
        .find((file) =>
          page.replace(/^use\-/, "").startsWith(getPageName(file)),
        )
    : entryFiles.find((file) => getPageName(file) === page);
  return file;
});

export const getContent = cache((config: Page, file: string, page: string) => {
  const reference = config.reference
    ? getReferences(file).find((reference) => getPageName(reference) === page)
    : undefined;
  if (config.reference && !reference) return;
  return getPageContent(reference || file);
});

export interface PageMarkdownProps {
  category: string;
  page: string;
  section?: string;
  content?: string;
  file?: string;
  showHovercards?: boolean;
}

export function PageMarkdown({
  category,
  page,
  content,
  file,
  showHovercards = true,
}: PageMarkdownProps) {
  const hovercards = new Set<Promise<string | Iterable<string>>>();

  if (!content || !file) {
    const config = pagesConfig.pages.find((page) => page.slug === category);
    if (!config) return null;
    file = file ?? getFile(config, page);
    if (!file) return null;
    content = content ?? getContent(config, file, page);
    if (!content) return null;
  }

  const pageDetail = pageIndex[category]?.find((item) => item.slug === page);

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
                file={file!}
                hovercards={showHovercards ? hovercards : undefined}
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
