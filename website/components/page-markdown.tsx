import pagesConfig from "build-pages/config.js";
import { getPageContent } from "build-pages/get-page-content.js";
import { getPageEntryFilesCached } from "build-pages/get-page-entry-files.js";
import { getPageName } from "build-pages/get-page-name.js";
import pageIndex from "build-pages/index.js";
import { getReferences } from "build-pages/reference-utils.js";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { rehypeCodeMeta } from "utils/rehype-code-meta.js";
import { rehypeWrapHeadings } from "utils/rehype-wrap-headings.js";
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
import { PagePre } from "./page-pre.jsx";
import { PageVideo } from "./page-video.jsx";

export interface PageMarkdownProps {
  category: string;
  page: string;
  section?: string;
  content?: string;
  file?: string;
}

export function PageMarkdown({
  category,
  page,
  content,
  file,
}: PageMarkdownProps) {
  if (!content || !file) {
    const config = pagesConfig.pages.find((page) => page.slug === category);
    if (!config) return null;

    const entryFiles = getPageEntryFilesCached(config);

    file =
      file ??
      (config.reference
        ? entryFiles.find((file) =>
            page!.replace(/^use\-/, "").startsWith(getPageName(file)),
          )
        : entryFiles.find((file) => getPageName(file) === page));

    if (!file) return null;

    const reference = config.reference
      ? getReferences(file).find((reference) => getPageName(reference) === page)
      : undefined;

    if (config.reference && !reference) return null;

    content = getPageContent(reference || file);
  }

  const { content: contentWithoutMatter } = matter(content);
  const pageDetail = pageIndex[category]?.find((item) => item.slug === page);

  return (
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
        pre: PagePre,
        kbd: PageKbd,
        strong: PageStrong,
        video: PageVideo,
        img: PageImage,

        a(props) {
          return <PageA {...props} file={file!} />;
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
  );
}
