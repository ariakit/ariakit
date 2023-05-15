import { Children, isValidElement, useId } from "react";
import type { ReactNode } from "react";
import { cx } from "@ariakit/core/utils/misc";
import pagesConfig from "build-pages/config.js";
import { getPageContent } from "build-pages/get-page-content.js";
import { getPageEntryFiles } from "build-pages/get-page-entry-files.js";
import { getPageName } from "build-pages/get-page-name.js";
import { getPageTreeFromContent } from "build-pages/get-page-tree.js";
import pagesIndex from "build-pages/index.js";
import type { TableOfContents as TableOfContentsData } from "build-pages/types.js";
import { CodeBlock } from "components/code-block.js";
import matter from "gray-matter";
import { ArrowRight } from "icons/arrow-right.jsx";
import { Hashtag } from "icons/hashtag.js";
import { NewWindow } from "icons/new-window.js";
import Link from "next/link.js";
import { notFound } from "next/navigation.js";
import parseNumericRange from "parse-numeric-range";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";
import { rehypeCodeMeta } from "utils/rehype-code-meta.js";
import { rehypeWrapHeadings } from "utils/rehype-wrap-headings.js";
import { tw } from "utils/tw.js";
import { PageExample } from "./page-example.js";
import { TableOfContents } from "./table-of-contents.js";

const { pages } = pagesConfig;

const stickyHeading = tw`
  sticky md:static top-16 z-20 py-2 -my-2 md:my-0 md:py-0 scroll-mt-16
  flex items-center md:block pr-12 md:pr-0
  min-h-[56px] md:min-h-0 bg-gray-50 dark:bg-gray-800
`;

const style = {
  main: tw`
    relative flex w-full min-w-[1px] max-w-5xl
    flex-col items-center gap-8 px-3 md:mt-12 md:px-4 lg:px-8
  `,
  wrapper: tw`
    flex flex-col items-center justify-center gap-8 w-full
    [&>*]:max-w-3xl [&>*]:w-full scroll-mt-20 md:scroll-mt-24

    data-[level="1"]:mt-0 data-[level="2"]:mt-6 data-[level="3"]:mt-2
  `,
  link: tw`
    rounded-sm focus-visible:no-underline focus-visible:ariakit-outline-input
    underline [text-decoration-skip-ink:none]
    decoration-1 hover:decoration-[3px]
    underline-offset-[0.25em]
    font-medium dark:font-normal
    text-blue-700 dark:text-blue-400
  `,
  h1: tw`
    text-2xl sm:text-4xl md:text-5xl font-extrabold dark:font-bold
    tracking-[-0.035em] dark:tracking-[-0.015em]
    ${stickyHeading}
  `,
  h2: tw`
    text-xl sm:text-2xl md:text-3xl font-semibold dark:font-medium
    text-black dark:text-white
    tracking-[-0.035em] dark:tracking-[-0.015em]
    ${stickyHeading}
  `,
  h3: tw`
    text-lg sm:text-xl font-semibold dark:font-medium
    text-black dark:text-white
    tracking-[-0.035em] dark:tracking-[-0.015em]
    ${stickyHeading}
  `,
  description: tw`
    -translate-y-2
    text-lg sm:text-xl sm:leading-8
    !text-black/70 dark:!text-white/60
  `,
  aside: tw`
    flex flex-col items-center justify-center w-full gap-4 p-4 pl-5 sm:p-8
    rounded-lg sm:rounded-xl !rounded-l relative overflow-hidden
    !max-w-[832px] [&>*]:max-w-3xl [&>*]:w-full

    before:absolute before:top-0 before:left-0 before:bottom-0 before:w-1

    data-[type="danger"]:bg-red-100/70
    data-[type="danger"]:dark:bg-red-700/20
    data-[type="danger"]:before:bg-red-600

    data-[type="warn"]:bg-amber-100
    data-[type="warn"]:dark:bg-amber-800/20
    data-[type="warn"]:before:bg-amber-500
    data-[type="warn"]:before:dark:bg-yellow-600

    data-[type="note"]:bg-blue-50
    data-[type="note"]:dark:bg-blue-900/20
    data-[type="note"]:before:bg-blue-600
  `,
  figure: tw`
    group flex flex-col gap-2 !max-w-[736px]
    data-[type=bigquote]:!w-auto
    data-[type=bigquote]:p-4
  `,
  blockquote: tw`
    flex flex-col gap-4 p-4 !max-w-[736px]
    border-l-4 border-black/25 dark:border-white/25
    group-data-[type=bigquote]:border-0
    group-data-[type=bigquote]:italic
    group-data-[type=bigquote]:p-0
    group-data-[type=bigquote]:text-lg
    group-data-[type=bigquote]:sm:text-xl
    group-data-[type=bigquote]:md:text-2xl
    group-data-[type=bigquote]:opacity-75
  `,
  paragraph: tw`
    dark:text-white/[85%] leading-7 tracking-[-0.016em] dark:tracking-[-0.008em]

    [p&_code]:rounded [p&_code]:p-1 [p&_code]:text-[0.9375em]
    [p&_code]:bg-black/[6.5%] dark:[p&_code]:bg-white/[6.5%]
    [p&_code]:font-monospace
  `,
  strong: tw`
    font-semibold dark:text-white
  `,
  list: tw`
    flex flex-col gap-4 pl-10 list-none
  `,
  listItem: tw`
    relative flex flex-col gap-2
  `,
  listItemNumber: tw`
    flex items-center justify-center
    h-6 w-6 text-sm rounded-full
    absolute -translate-x-8 translate-y-0.5
    bg-blue-600 text-white
  `,
  listItemBullet: tw`
    absolute -translate-x-8
    w-7 p-1 text-black/50 dark:text-white/50
  `,
  pre: tw`
    data-[api]:leading-8 data-[api]:tracking-wide
    data-[api]:text-black/60 dark:data-[api]:text-white/60
  `,
};

function getPageNames(dir: string | string[]) {
  return getPageEntryFiles(dir).map(getPageName);
}

export function generateStaticParams() {
  const params = pages.flatMap((page) => {
    const pages = getPageNames(page.sourceContext);
    const category = page.slug;
    return pages.map((page) => ({ category, page }));
  });
  return params;
}

interface PageProps {
  params: ReturnType<typeof generateStaticParams>[number];
}

export async function generateMetadata({ params }: PageProps) {
  const { category, page } = params;
  const data = pagesIndex[category]?.find((item) => item.slug === page);

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

  const { sourceContext } = config;

  const entryFiles = getPageEntryFiles(sourceContext);
  const file = entryFiles.find((file) => getPageName(file) === page);

  if (!file) return notFound();

  const content = getPageContent(file);
  const { content: contentWithoutMatter } = matter(content);
  const tree = getPageTreeFromContent(content);
  const pageDetail = pagesIndex[category]?.find((item) => item.slug === page);
  const categoryDetail = pagesConfig.pages.find(
    (item) => item.slug === category
  );

  if (!categoryDetail) return notFound();

  const tableOfContents: TableOfContentsData = [
    {
      id: "",
      href: `/${category}`,
      text: categoryDetail.title,
    },
    {
      id: "",
      href: `/${category}/${page}`,
      text: pageDetail?.title ?? page,
      children: tree.data?.tableOfContents as TableOfContentsData,
    },
  ];

  return (
    <div className="flex flex-col items-start justify-center md:flex-row-reverse">
      <TableOfContents data={tableOfContents} />
      <main className={style.main}>
        <ReactMarkdown
          rehypePlugins={[
            rehypeCodeMeta,
            rehypeRaw,
            rehypeSlug,
            rehypeWrapHeadings,
          ]}
          components={{
            div: ({ node, ...props }) => {
              if (node.properties?.dataLevel) {
                return (
                  <div
                    {...props}
                    className={cx(style.wrapper, props.className)}
                  />
                );
              }
              return <div {...props} />;
            },
            h1: ({ node, level, ...props }) => (
              <h1 {...props} className={cx(style.h1, props.className)} />
            ),
            h2: ({ node, level, id, ...props }) => (
              <h2 {...props} className={cx(style.h2, props.className)}>
                <a href={`#${id}`}>{props.children}</a>
              </h2>
            ),
            h3: ({ node, level, id, ...props }) => (
              <h3 {...props} className={cx(style.h3, props.className)}>
                <a href={`#${id}`}>{props.children}</a>
              </h3>
            ),
            ul: ({ node, ordered, ...props }) => {
              const className = cx(style.list, props.className);
              return <ul {...props} className={className} />;
            },
            ol: ({ node, ordered, ...props }) => {
              const className = cx(style.list, props.className);
              return <ol {...props} className={className} />;
            },
            li: ({ node, ordered, index, ...props }) => {
              const className = cx(style.listItem, props.className);
              const isMultiline = Children.toArray(props.children)[0] === "\n";
              return (
                <li {...props} className={className}>
                  {ordered ? (
                    <span className={style.listItemNumber}>{index + 1}</span>
                  ) : (
                    <ArrowRight className={style.listItemBullet} />
                  )}
                  {isMultiline ? (
                    props.children
                  ) : (
                    <p className={style.paragraph}>{props.children}</p>
                  )}
                </li>
              );
            },
            aside: ({ node, title, ...props }) => {
              const id = useId();
              const className = cx(style.aside, props.className);
              if (!title) {
                return <div {...props} className={className} />;
              }
              return (
                <aside {...props} className={className} aria-labelledby={id}>
                  <p className={style.paragraph}>
                    <strong id={id} className={style.strong}>
                      {title}
                    </strong>
                  </p>
                  {props.children}
                </aside>
              );
            },
            figure: ({ node, ...props }) => {
              const className = cx(style.figure, props.className);
              return <figure {...props} className={className} />;
            },
            blockquote: ({ node, ...props }) => {
              const className = cx(style.blockquote, props.className);
              return <blockquote {...props} className={className} />;
            },
            pre: ({ node, ...props }) => {
              const pre = (
                <pre {...props} className={cx(style.pre, props.className)} />
              );
              const child = props.children[0];
              if (!child) return pre;
              type Props = {
                children: ReactNode;
                className?: string;
                meta?: string;
              };
              if (!isValidElement<Props>(child)) return pre;
              if (child.type !== "code") return pre;
              if (!child.props) return pre;
              if (!child.props.children) return pre;
              if (!Array.isArray(child.props.children)) return pre;
              const [code] = child.props.children;
              if (typeof code !== "string") return pre;
              const lang = child.props.className?.replace("language-", "");
              const meta = child.props.meta?.split(" ") || [];
              const lineNumbers = meta.includes("lineNumbers");
              const rangePattern = /^\{([\d\-,]+)\}$/;
              const highlightLines = meta
                .filter((item) => rangePattern.test(item))
                .flatMap((item) =>
                  parseNumericRange(item.replace(rangePattern, "$1"))
                );
              return (
                // @ts-expect-error RSC
                <CodeBlock
                  lang={lang}
                  code={code}
                  highlightLines={highlightLines}
                  lineNumbers={lineNumbers}
                  className="!max-w-[832px]"
                />
              );
            },
            p: ({ node, ...props }) => {
              const paragraph = (
                <p
                  {...props}
                  className={cx(
                    style.paragraph,
                    "data-description" in props && style.description,
                    props.className
                  )}
                />
              );
              const child = props.children[0];
              if (!child) return paragraph;
              if (!isValidElement(child)) return paragraph;
              if (!child.props) return paragraph;
              if (!("data-playground" in child.props)) return paragraph;
              if (!child.props.href) return paragraph;
              return <>{props.children}</>;
            },
            strong: ({ node, ...props }) => (
              <strong
                {...props}
                className={cx(style.strong, props.className)}
              />
            ),
            a: ({ node, href, ...props }) => {
              if ("data-playground" in props && href) {
                return (
                  // @ts-expect-error RSC
                  <PageExample pageFilename={file} href={href} {...props} />
                );
              }
              const className = cx(style.link, props.className);
              if (href?.startsWith("http")) {
                return (
                  <a
                    {...props}
                    href={href}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className={className}
                  >
                    {props.children}
                    <NewWindow
                      className={tw`mb-0.5 ml-0.5 inline h-[1em] w-[1em]
                    stroke-black/60 dark:stroke-white/60`}
                    />
                  </a>
                );
              }
              if (href?.startsWith("/apis")) {
                return <span>{props.children}</span>;
              }
              if (href?.startsWith("#")) {
                return (
                  <a {...props} href={href} className={className}>
                    <Hashtag
                      className={tw`mb-0.5 inline h-[1em] w-[1em] stroke-black/60
                      dark:stroke-white/60`}
                    />
                    {props.children}
                  </a>
                );
              }
              if (href) {
                return <Link {...props} href={href} className={className} />;
              }
              return <a {...props} className={className} />;
            },
          }}
        >
          {contentWithoutMatter}
        </ReactMarkdown>
      </main>
    </div>
  );
}
