import { Children, cloneElement, isValidElement, useId } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cx } from "@ariakit/core/utils/misc";
import pagesConfig from "build-pages/config.js";
import { getPageContent } from "build-pages/get-page-content.js";
import { getPageEntryFiles } from "build-pages/get-page-entry-files.js";
import { getPageName } from "build-pages/get-page-name.js";
import { getPageTitle } from "build-pages/get-page-title.js";
import { getPageTreeFromContent } from "build-pages/get-page-tree.js";
import pageIndex from "build-pages/index.js";
import pageLinks from "build-pages/links.js";
import { getReferences } from "build-pages/reference-utils.js";
import type {
  Page,
  TableOfContents as TableOfContentsData,
} from "build-pages/types.js";
import { CodeBlock } from "components/code-block.js";
import { NewsletterForm } from "components/newsletter-form.jsx";
import { PageItem } from "components/page-item.jsx";
import { PageVideo } from "components/page-video.jsx";
import matter from "gray-matter";
import type { Element, ElementContent } from "hast";
import { ArrowRight } from "icons/arrow-right.jsx";
import { ChevronRight } from "icons/chevron-right.jsx";
import { Document } from "icons/document.jsx";
import { FolderOpen } from "icons/folder-open.jsx";
import { Hashtag } from "icons/hashtag.js";
import { NewWindow } from "icons/new-window.js";
import { kebabCase } from "lodash-es";
import Image from "next/image.js";
import Link from "next/link.js";
import { notFound } from "next/navigation.js";
import parseNumericRange from "parse-numeric-range";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { twJoin, twMerge } from "tailwind-merge";
import invariant from "tiny-invariant";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";
import { getPageIcon } from "utils/get-page-icon.jsx";
import { isValidHref } from "utils/is-valid-href.js";
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
  sticky md:static top-14 z-20 pb-2 -mb-2 md:mb-0 md:pb-0
  flex items-center md:block pr-12 md:pr-0
  min-h-[48px] md:min-h-0 bg-gray-50 dark:bg-gray-800
`;

const style = {
  link: tw`
    pb-1.5 pt-1 -mb-1.5 -mt-1 relative
    rounded-sm focus-visible:no-underline focus-visible:ariakit-outline-input
    underline [text-decoration-skip-ink:none]
    decoration-1 hover:decoration-[3px]
    underline-offset-[0.25em]
    font-medium dark:font-normal
    text-blue-700 dark:text-blue-400
    [&>code]:text-inherit
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
  h4: tw`
    text-sm uppercase opacity-70 tracking-wider
  `,
  hr: tw`
    w-full border-t border-black/10 dark:border-white/10
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
    group gap-2 flex-col grid-cols-1 sm:grid-cols-2 overflow-hidden
    rounded-lg md:rounded-xl

    [&>img]:!rounded-none
    data-[wide]:!max-w-5xl data-[wide]:md:rounded-2xl
    data-[media]:grid
    data-[quote]:flex data-[quote]:!max-w-[736px]
    data-[bigquote]:flex data-[bigquote]:!w-auto data-[bigquote]:p-4
  `,
  media: tw`
    overflow-hidden rounded-lg md:rounded-xl
    data-[large]:!max-w-[832px]
    data-[wide]:!max-w-5xl
    data-[wide]:md:rounded-2xl
  `,
  blockquote: tw`
    flex flex-col gap-4 px-4 !max-w-[736px]
    border-l-4 border-black/25 dark:border-white/25
    group-data-[bigquote]:border-0
    group-data-[bigquote]:italic
    group-data-[bigquote]:p-0
    group-data-[bigquote]:text-lg
    group-data-[bigquote]:sm:text-xl
    group-data-[bigquote]:md:text-2xl
    group-data-[bigquote]:opacity-75
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

function getNodeText(node: Element | ElementContent): string {
  if ("children" in node) return node.children.map(getNodeText).join("");
  if ("value" in node) return node.value;
  return "";
}

function findCardLinks(children: ReactNode & ReactNode[]): string[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement(child)
      ? child.props?.href
        ? child.props.href
        : child.props?.children
        ? findCardLinks(child.props.children)
        : []
      : [],
  );
}

function getPageNames({ sourceContext, pageFileRegex }: Page) {
  return getPageEntryFiles(sourceContext, pageFileRegex).map(getPageName);
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
    const entryFiles = getPageEntryFiles(
      page.sourceContext,
      page.pageFileRegex,
    );
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

  const entryFiles = getPageEntryFiles(
    config.sourceContext,
    config.pageFileRegex,
  );

  const file = config.reference
    ? entryFiles.find((file) =>
        page.replace(/^use\-/, "").startsWith(getPageName(file)),
      )
    : entryFiles.find((file) => getPageName(file) === page);

  if (!file) return notFound();

  const reference = config.reference
    ? getReferences(file).find((reference) => getPageName(reference) === page)
    : undefined;

  if (config.reference && !reference) return notFound();

  const content = getPageContent(reference || file);
  const { content: contentWithoutMatter } = matter(content);
  const tree = getPageTreeFromContent(content);
  const pageDetail = pageIndex[category]?.find((item) => item.slug === page);
  const categoryDetail = pagesConfig.pages.find(
    (item) => item.slug === category,
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
    <ul className="flex flex-col p-2 text-black/90 dark:text-white/80 md:p-0 md:text-sm md:text-black/80 md:dark:text-white/70">
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
        <div className="sticky top-32 m-4 hidden h-screen max-h-[calc(100vh-theme(spacing.36))] w-60 flex-none flex-col gap-8 border-l border-black/10 dark:border-white/10 md:flex">
          <nav className="w-full flex-1 flex-col gap-4 overflow-auto p-3 pr-1">
            {navList}
          </nav>
          {nextPageLink}
        </div>
      </TableOfContents>
      <main className="relative flex w-full min-w-[1px] max-w-5xl flex-col items-center gap-8 px-3 md:mt-12 md:px-4 lg:px-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
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
                    className={twJoin(
                      "flex w-full flex-col items-center justify-center gap-8",
                      "scroll-mt-16 md:scroll-mt-24 [&>*]:w-full [&>*]:max-w-3xl",
                      `data-[level="1"]:mt-0 data-[level="2"]:mt-6 data-[level="3"]:mt-2`,
                      props.className,
                    )}
                  />
                );
              }
              if (node.properties?.dataDescription != null) {
                const paragraph = props.children[1];
                invariant(
                  isValidElement<ComponentPropsWithoutRef<"p">>(paragraph),
                  "Expected paragraph",
                );
                const { children, ...otherProps } = props;
                return cloneElement(paragraph, {
                  ...otherProps,
                  className: twJoin(
                    props.className,
                    paragraph.props.className,
                    style.description,
                  ),
                });
              }
              if (node.properties?.dataTags != null) {
                const tags = pageDetail?.tags ?? [];
                if (!tags.length) return null;
                return (
                  <div
                    {...props}
                    className={twJoin(
                      "flex flex-wrap gap-2 [[data-description]+&]:-translate-y-2",
                      props.className,
                    )}
                  >
                    {tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${kebabCase(tag)}`}
                        className="rounded-full border border-black/[15%] bg-black/5 p-2 px-4 font-medium text-black/90 hover:bg-black/10 focus-visible:ariakit-outline-input dark:border-gray-650 dark:bg-gray-850 dark:text-white/90 hover:dark:bg-gray-750 sm:text-sm"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                );
              }
              if (node.properties?.dataCards != null) {
                const links = findCardLinks(props.children);
                const pages = links.flatMap((link) => {
                  const [, category, slug] = link
                    .replace("https://ariakit.org", "")
                    .split("/");
                  if (!category || !slug) return [];
                  const page = pageIndex[category]?.find(
                    (item) => item.slug === slug,
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
                      className={twJoin(
                        style.cards,
                        props.className,
                        "!max-w-[792px]",
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
            h4: ({ node, level, id, ...props }) => (
              <h4 {...props} className={cx(style.h4, props.className)}>
                {props.children}
              </h4>
            ),
            hr: ({ node, ...props }) => (
              <hr {...props} className={cx(style.hr, props.className)} />
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
              const definition = meta.includes("definition");
              const rangePattern = /^\{([\d\-,]+)\}$/;
              const highlightLines = meta
                .filter((item) => rangePattern.test(item))
                .flatMap((item) =>
                  parseNumericRange(item.replace(rangePattern, "$1")),
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
                  type={definition ? "definition" : undefined}
                  lang={lang}
                  code={code}
                  lineNumbers={lineNumbers}
                  highlightLines={highlightLines}
                  highlightTokens={highlightTokens}
                  className={definition ? "" : "!max-w-[832px]"}
                />
              );
            },
            p: ({ node, ...props }) => {
              const paragraph = (
                <p
                  {...props}
                  className={twJoin(style.paragraph, props.className)}
                />
              );
              if (Array.isArray(props.children) && props.children.length > 1) {
                return paragraph;
              }
              const child = props.children[0];
              if (!child) return paragraph;
              if (!isValidElement(child)) return paragraph;
              if (!child.props) return paragraph;
              if ("data-large" in child.props) return child;
              if (!("data-playground" in child.props)) return paragraph;
              if (!child.props.href) return paragraph;
              return <>{props.children}</>;
            },
            kbd: ({ node, ...props }) => (
              <kbd
                {...props}
                className={twJoin(
                  "font-monospace rounded-[0.2667em] rounded-b-[0.3334em] border-b-[0.1334em] border-t-[0.0667em] border-b-black/[7.5%] border-t-white bg-gradient-to-b from-black/[15%] to-black/5 p-[0.1334em] px-[0.2667em] text-[0.9375em] [box-shadow:0_0_0_max(1px,0.033333em)_rgba(0,0,0,0.25)] dark:rounded-b-[0.4em] dark:border-b-[0.2em] dark:border-t-0 dark:border-b-black/40 dark:from-white/10 dark:to-white/[15%] dark:[box-shadow:0_min(-1px,-0.0666em)_rgba(255,255,255,0.1),0_0_0_max(1px,0.0666em)_rgba(255,255,255,0.15)]",
                  props.className,
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
                  <PageExample
                    pageFilename={file}
                    href={href}
                    {...props}
                    type={props.type as any}
                  />
                );
              }
              let className = twJoin(style.link, props.className);
              href = href?.replace(/^https:\/\/(www\.)?ariakit.org/, "");
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
                    <NewWindow className="mb-0.5 ml-0.5 inline h-[1em] w-[1em] stroke-black/60 dark:stroke-white/60" />
                  </a>
                );
              }
              if (href?.startsWith("/apis")) {
                return <span>{props.children}</span>;
              }
              if (href?.startsWith("#")) {
                return (
                  <a {...props} href={href} className={className}>
                    <Hashtag className="mb-0.5 inline h-[1em] w-[1em] stroke-black/60 dark:stroke-white/60" />
                    {props.children}
                  </a>
                );
              }
              if (href) {
                if (!isValidHref(href, pageLinks)) {
                  throw new Error(`Invalid link: ${href}`);
                }
                const url = new URL(href, "https://ariakit.org");
                const [, category, page] = url.pathname.split("/");
                if (category === "reference" && page) {
                  const hash = url.hash.replace("#", "");
                  const text = getNodeText(node);
                  const isComponent = /^[A-Z]/.test(text);
                  const isHook = page.startsWith("use-");
                  className = twMerge(
                    className,
                    "decoration-dotted hover:decoration-solid",
                    hash
                      ? isHook
                        ? "text-[#000f80] dark:text-[#9cdcfe]"
                        : "text-[#ce0000] dark:text-[#9cdcfe]"
                      : isComponent
                      ? "text-[#227289] dark:text-[#4ec9b0]"
                      : "text-[#795e26] dark:text-[#dcdcaa]",
                  );
                }
                return <Link {...props} href={href} className={className} />;
              }
              return <a {...props} className={className} />;
            },
            img: ({ node, ...props }) => {
              const className = cx(style.media, props.className);
              return <Image {...props} className={className} />;
            },
            video: ({ node, ...props }) => {
              const className = cx(style.media, props.className);
              return <PageVideo {...props} className={className} />;
            },
          }}
        >
          {contentWithoutMatter}
        </ReactMarkdown>
        <div className="mt-20 grid w-full max-w-[832px] grid-cols-1 justify-between gap-4 rounded-lg bg-gradient-to-br from-blue-50 to-pink-50 p-4 dark:from-blue-600/30 dark:to-pink-600/10 sm:grid-cols-2 sm:gap-8 sm:rounded-xl sm:p-8">
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
