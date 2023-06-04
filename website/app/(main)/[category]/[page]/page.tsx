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
import { PageItem } from "components/page-item.jsx";
import matter from "gray-matter";
import { ArrowRight } from "icons/arrow-right.jsx";
import { Document } from "icons/document.jsx";
import { FolderOpen } from "icons/folder-open.jsx";
import { Hashtag } from "icons/hashtag.js";
import { NewWindow } from "icons/new-window.js";
import Image from "next/image.js";
import Link from "next/link.js";
import { notFound } from "next/navigation.js";
import parseNumericRange from "parse-numeric-range";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import invariant from "tiny-invariant";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";
import { getPageIcon } from "utils/get-page-icon.jsx";
import { rehypeCodeMeta } from "utils/rehype-code-meta.js";
import { rehypeWrapHeadings } from "utils/rehype-wrap-headings.js";
import { tw } from "utils/tw.js";
import { PageExample } from "./page-example.js";
import { TableOfContents } from "./table-of-contents.js";

const { pages } = pagesConfig;

const headingBase = tw`
  text-black dark:text-white
  tracking-[-0.035em] dark:tracking-[-0.015em]

  [&_code]:font-monospace [&_code]:rounded
  [&_code]:px-[0.2em] [&_code]:py-[0.15em]
  [&_code]:bg-black/[7.5%] dark:[&_code]:bg-white/[7.5%]
`;

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
  sidebar: tw`
    hidden md:flex sticky top-32 m-4 flex-col gap-8 flex-none
    w-60 max-h-[calc(100vh-theme(spacing.36))]
    border-l border-black/10 dark:border-white/10
  `,
  nav: tw`
    flex-col gap-4 overflow-auto p-3 pr-0 w-full
  `,
  navList: tw`
    flex flex-col md:text-sm text-black/90 dark:text-white/80
    md:text-black/80 md:dark:text-white/70 p-2 md:p-0
  `,
  navSublist: tw`
    flex flex-col
  `,
  navItem: tw`
    flex flex-col
  `,
  navLink: tw`
    group flex items-start gap-2 md:gap-1 py-1.5 pr-4 rounded
    aria-[current]:bg-blue-200/40 dark:aria-[current]:bg-blue-600/25
    underline-offset-[0.2em] hover:text-black dark:hover:text-white
    focus-visible:ariakit-outline-input

    data-[depth="0"]:pl-2 data-[depth="1"]:pl-9 data-[depth="2"]:pl-16 data-[depth="3"]:pl-24
    md:data-[depth="0"]:pl-1 md:data-[depth="1"]:pl-6 md:data-[depth="2"]:pl-9 md:data-[depth="3"]:pl-12
  `,
  navLinkText: tw`
    [@media(any-hover:hover)]:group-hover:underline
    group-aria-[current]:text-black dark:group-aria-[current]:text-white
  `,
  navIcon: tw`
    w-5 h-5 md:w-4 md:h-4 flex-none opacity-60 translate-y-px
    group-aria-[current]:opacity-100
  `,
  wrapper: tw`
    flex flex-col items-center justify-center gap-8 w-full
    [&>*]:max-w-3xl [&>*]:w-full scroll-mt-20 md:scroll-mt-24

    data-[level="1"]:mt-0 data-[level="2"]:mt-6 data-[level="3"]:mt-2
  `,
  link: tw`
    pb-1.5 pt-1 -mb-1.5 -mt-1 relative
    rounded-sm focus-visible:no-underline focus-visible:ariakit-outline-input
    underline [text-decoration-skip-ink:none]
    decoration-1 hover:decoration-[3px]
    underline-offset-[0.25em]
    font-medium dark:font-normal
    text-blue-700 dark:text-blue-400
    [&>code]:text-blue-900 [&>code]:dark:text-blue-300
  `,
  h1: tw`
    text-2xl sm:text-4xl md:text-5xl font-extrabold dark:font-bold
    ${headingBase}
    ${stickyHeading}
  `,
  h2: tw`
    text-xl sm:text-2xl md:text-3xl font-semibold dark:font-medium
    [&_code]:font-medium
    ${headingBase}
    ${stickyHeading}
  `,
  h3: tw`
    text-lg sm:text-xl font-semibold dark:font-medium
    ${headingBase}
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

    data-[type="note"]:bg-blue-50/70
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

    [p&_code]:rounded [p&_code]:text-[0.9375em]
    [p&_code]:px-[0.25em] [p&_code]:py-[0.2em]
    [p&_code]:bg-black/[7.5%] dark:[p&_code]:bg-white/[7.5%]
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
  cards: tw`
    grid grid-cols-1 gap-4 md:grid-cols-2
  `,
};

function findCardLinks(children: ReactNode & ReactNode[]): string[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement(child)
      ? child.props?.href
        ? child.props.href
        : child.props?.children
        ? findCardLinks(child.props.children)
        : []
      : []
  );
}

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
      href: "#",
      text: pageDetail?.title ?? page,
      children: tree.data?.tableOfContents as TableOfContentsData,
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
      const icon = isFolder ? (
        <FolderOpen className={style.navIcon} />
      ) : isPage ? (
        <Document className={style.navIcon} />
      ) : null;
      return (
        <li key={item.href} className={style.navItem}>
          <Component
            href={item.href}
            data-depth={depth}
            className={style.navLink}
          >
            {icon}
            <span className={style.navLinkText}>{item.text}</span>
          </Component>
          {item.children && (
            <ul className={style.navSublist}>
              {renderTableOfContents(item.children, depth + 1)}
            </ul>
          )}
        </li>
      );
    });

  const sortedIndex = Object.values(pagesIndex).flatMap((item) =>
    [...item].sort((a, b) => {
      if (a.group === b.group) return 0;
      if (!a.group && b.group) return -1;
      if (a.group && !b.group) return 1;
      if (!a.group || !b.group) return 0;
      return a.group > b.group ? 1 : -1;
    })
  );

  const pageIndex =
    pageDetail && sortedIndex ? sortedIndex.indexOf(pageDetail) : -1;
  let nextPage = pageIndex !== -1 ? sortedIndex?.[pageIndex + 1] : undefined;
  nextPage = nextPage?.unlisted ? sortedIndex?.[pageIndex + 2] : nextPage;

  const nextPageLink = nextPage && (
    <Link
      href={`/${nextPage.category}/${nextPage.slug}`}
      className="group flex w-auto items-center gap-3 rounded-lg p-2 pr-4 active:bg-blue-200/70 focus-visible:ariakit-outline-input dark:active:!bg-blue-800/25 md:ml-3 [@media(any-hover:hover)]:hover:bg-blue-200/40 [@media(any-hover:hover)]:dark:hover:bg-blue-600/25"
    >
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded bg-gray-150 group-hover:bg-black/[7.5%] dark:bg-gray-850 dark:group-hover:bg-black/80">
        {getPageIcon(nextPage.category, nextPage.slug) || <span />}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden text-sm">
        <div className="font-semibold">Up Next</div>
        <div className="truncate opacity-60">{nextPage.title}</div>
      </div>
    </Link>
  );

  const navList = (
    <ul className={style.navList}>{renderTableOfContents(tableOfContents)}</ul>
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
        <div className={style.sidebar}>
          <nav className={style.nav}>{navList}</nav>
          {nextPageLink}
        </div>
      </TableOfContents>
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
              if (node.properties?.dataCards != null) {
                const links = findCardLinks(props.children);
                const pages = links.flatMap((link) => {
                  const [, category, slug] = link.split("/");
                  if (!category || !slug) return [];
                  const page = pagesIndex[category]?.find(
                    (item) => item.slug === slug
                  );
                  return page || [];
                });
                const type = node.properties.dataCards;
                const isComponents = type === "components";
                const isExamples = type === "examples";
                const isComponentPage = category === "components";
                return (
                  <>
                    <div
                      {...props}
                      className={cx(
                        style.cards,
                        props.className,
                        (isExamples || isComponents) && "!max-w-[832px]"
                      )}
                    >
                      {pages.map((page) => (
                        <PageItem
                          key={page.slug}
                          href={`/${page.category}/${page.slug}`}
                          title={page.title}
                          description={page.content}
                          thumbnail={
                            getPageIcon(page.category, page.slug) || <span />
                          }
                        />
                      ))}
                    </div>
                    {isExamples && (
                      <div className="flex justify-center">
                        <Link
                          href={`/examples${isComponentPage ? `#${page}` : ""}`}
                          className={style.link}
                        >
                          View all
                          {isComponentPage ? ` ${pageDetail?.title}` : ""}{" "}
                          examples
                        </Link>
                      </div>
                    )}
                    {isComponents && (
                      <div className="flex justify-center">
                        <Link href="/components" className={style.link}>
                          View all components
                        </Link>
                      </div>
                    )}
                  </>
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
              const tokenPattern = /^"(.+)"([\d\-,]+)?$/;
              const highlightTokens = meta
                .filter((item) => tokenPattern.test(item))
                .map((item) => {
                  const [, token, ranges] = item.match(tokenPattern) || [];
                  invariant(token);
                  if (!ranges) return token;
                  return [token, parseNumericRange(ranges)] as const;
                });
              return (
                <CodeBlock
                  lang={lang}
                  code={code}
                  lineNumbers={lineNumbers}
                  highlightLines={highlightLines}
                  highlightTokens={highlightTokens}
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
            kbd: ({ node, ...props }) => (
              <kbd
                {...props}
                className={cx(
                  "font-monospace rounded-[0.25em] border border-black/[15%] bg-black/[6.5%] p-[0.15em] px-[0.3em] text-[0.9375em] [box-shadow:0_0.15em_0_rgba(0,0,0,0.15)] dark:border-white/[15%] dark:bg-white/10 dark:[box-shadow:0_0.15em_0_rgba(255,255,255,0.15)]",
                  props.className
                )}
              />
            ),
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
            img: ({ node, ...props }) => {
              // @ts-expect-error
              return <Image {...props} />;
            },
          }}
        >
          {contentWithoutMatter}
        </ReactMarkdown>
      </main>
    </div>
  );
}
