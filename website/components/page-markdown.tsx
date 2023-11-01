import { Children, cloneElement, isValidElement, useId } from "react";
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import pagesConfig from "build-pages/config.js";
import { getPageContent } from "build-pages/get-page-content.js";
import { getPageEntryFilesCached } from "build-pages/get-page-entry-files.js";
import { getPageName } from "build-pages/get-page-name.js";
import pageIndex from "build-pages/index.js";
import pageLinks from "build-pages/links.js";
import { getReferences } from "build-pages/reference-utils.js";
import matter from "gray-matter";
import type { Element, ElementContent } from "hast";
import { ArrowRight } from "icons/arrow-right.jsx";
import { Hashtag } from "icons/hashtag.jsx";
import { NewWindow } from "icons/new-window.jsx";
import Image from "next/image.js";
import Link from "next/link.js";
import parseNumericRange from "parse-numeric-range";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { twJoin, twMerge } from "tailwind-merge";
import invariant from "tiny-invariant";
import { getPageIcon } from "utils/get-page-icon.jsx";
import { isValidHref } from "utils/is-valid-href.js";
import { rehypeCodeMeta } from "utils/rehype-code-meta.js";
import { rehypeWrapHeadings } from "utils/rehype-wrap-headings.js";
import { getTagSlug } from "utils/tag.js";
import { CodeBlock } from "./code-block.jsx";
import { InlineLink } from "./inline-link.jsx";
import { PageExample } from "./page-example.jsx";
import { PageItem } from "./page-item.jsx";
import {
  PageMarkdownSection,
  PageMarkdownSectionProvider,
} from "./page-markdown-section.jsx";
import { PageVideo } from "./page-video.jsx";
import { PreviewLink } from "./preview-link.jsx";

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

function wrapWithSection(node: ReactNode, section?: string) {
  if (!section) return node;
  return (
    <PageMarkdownSectionProvider section={section}>
      {node}
    </PageMarkdownSectionProvider>
  );
}

const style = {
  headingBase: twJoin(
    "text-black dark:text-white tracking-[-0.035em] dark:tracking-[-0.015em]",
    "[&_code]:font-monospace [&_code]:rounded [&_code]:px-[0.2em] [&_code]:py-[0.15em]",
    "[&_code]:bg-black/[7.5%] dark:[&_code]:bg-white/[7.5%]",
  ),

  stickyHeading: twJoin(
    "sticky md:static top-14 z-20 pb-2 -mb-2 md:mb-0 md:pb-0 flex items-center",
    "md:block pr-12 md:pr-0 min-h-[48px] md:min-h-0 bg-gray-50 dark:bg-gray-800",
  ),

  paragraph: twJoin(
    "dark:text-white/[85%] leading-7 tracking-[-0.016em] dark:tracking-[-0.008em]",
    "[p&_code]:rounded [p&_code]:text-[0.9375em]",
    "[p&_code]:px-[0.25em] [p&_code]:py-[0.2em]",
    "[p&_code]:bg-black/[7.5%] dark:[p&_code]:bg-white/[7.5%]",
    "[p&_code]:font-monospace",
  ),

  media: twJoin(
    "overflow-hidden rounded-lg md:rounded-xl data-[large]:!max-w-[832px]",
    "data-[wide]:!max-w-5xl data-[wide]:md:rounded-2xl",
  ),
};

export interface PageMarkdownProps {
  category: string;
  page: string;
  section?: string;
}

const cacheMap = new Map<string, ReactElement>();

export function PageMarkdown({ category, page, section }: PageMarkdownProps) {
  let cacheId =
    process.env.NODE_ENV === "production" ? `${category}/${page}` : "";
  const productionCachedValue = cacheMap.get(cacheId);

  if (productionCachedValue) {
    return wrapWithSection(productionCachedValue, section);
  }

  const config = pagesConfig.pages.find((page) => page.slug === category);
  if (!config) return null;

  const entryFiles = getPageEntryFilesCached(config);

  const file = config.reference
    ? entryFiles.find((file) =>
        page.replace(/^use\-/, "").startsWith(getPageName(file)),
      )
    : entryFiles.find((file) => getPageName(file) === page);

  if (!file) return null;

  const reference = config.reference
    ? getReferences(file).find((reference) => getPageName(reference) === page)
    : undefined;

  if (config.reference && !reference) return null;

  const content = getPageContent(reference || file);
  cacheId = process.env.NODE_ENV === "production" ? cacheId : content;

  const developmentCachedValue = cacheMap.get(cacheId);

  if (developmentCachedValue) {
    return wrapWithSection(developmentCachedValue, section);
  }

  const { content: contentWithoutMatter } = matter(content);

  const pageDetail = pageIndex[category]?.find((item) => item.slug === page);

  const element = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeCodeMeta,
        rehypeRaw,
        rehypeSlug,
        rehypeWrapHeadings,
      ]}
      components={{
        div({ node, ...props }) {
          if (node.properties?.dataLevel) {
            return (
              <PageMarkdownSection
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
                "-translate-y-2 text-lg sm:text-xl sm:leading-8 !text-black/70 dark:!text-white/60",
                paragraph.props.className,
                props.className,
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
                    href={`/tags/${getTagSlug(tag)}`}
                    className="rounded-full border-black/[15%] bg-black/[7.5%] p-2 px-4 text-sm font-medium text-black/90 hover:bg-black/[15%] focus-visible:ariakit-outline-input dark:border dark:border-gray-650 dark:bg-gray-850 dark:text-white/90 hover:dark:bg-gray-750"
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
                    props.className,
                    "grid !max-w-[792px] grid-cols-1 gap-4 md:grid-cols-2",
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
                    <InlineLink
                      render={
                        <Link
                          href={`/examples${isComponentPage ? `#${page}` : ""}`}
                        />
                      }
                    >
                      View all
                      {isComponentPage ? ` ${pageDetail?.title}` : ""} examples
                    </InlineLink>
                  </div>
                )}
                {isComponents && (
                  <div className="flex justify-center">
                    <InlineLink render={<Link href="/components" />}>
                      View all components
                    </InlineLink>
                  </div>
                )}
              </>
            );
          }
          return <div {...props} />;
        },

        h1({ node, level, ...props }) {
          const className = twJoin(
            style.headingBase,
            style.stickyHeading,
            "text-2xl font-extrabold dark:font-bold sm:text-4xl md:text-5xl",
            props.className,
          );
          return <h1 {...props} className={className} />;
        },

        h2({ node, level, id, ...props }) {
          const className = twJoin(
            style.headingBase,
            style.stickyHeading,
            "text-xl font-semibold dark:font-medium sm:text-2xl md:text-3xl [&_code]:font-medium",
            props.className,
          );
          return (
            <h2 {...props} className={className}>
              <a href={`#${id}`}>{props.children}</a>
            </h2>
          );
        },

        h3({ node, level, id, ...props }) {
          const className = twJoin(
            style.headingBase,
            style.stickyHeading,
            "text-lg font-semibold dark:font-medium sm:text-xl",
            props.className,
          );
          return (
            <h3 {...props} className={className}>
              <a href={`#${id}`}>{props.children}</a>
            </h3>
          );
        },

        h4({ node, level, id, ...props }) {
          const className = twJoin(
            "text-sm uppercase tracking-wider opacity-70",
            props.className,
          );
          return <h4 {...props} className={className} />;
        },

        hr({ node, ...props }) {
          const className = twJoin(
            "w-full border-t border-black/10 dark:border-white/10",
            props.className,
          );
          return <hr {...props} className={className} />;
        },

        ul({ node, ordered, ...props }) {
          const className = twJoin(
            "flex flex-col gap-4 pl-10 list-none",
            props.className,
          );
          return <ul {...props} className={className} />;
        },

        ol({ node, ordered, ...props }) {
          const className = twJoin(
            "flex flex-col gap-4 pl-10 list-none",
            props.className,
          );
          return <ol {...props} className={className} />;
        },

        li({ node, ordered, index, ...props }) {
          const className = twJoin(
            "relative flex flex-col gap-2",
            props.className,
          );
          const isMultiline = Children.toArray(props.children)[0] === "\n";
          return (
            <li {...props} className={className}>
              {ordered ? (
                <span className="absolute flex h-6 w-6 -translate-x-8 translate-y-0.5 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
                  {index + 1}
                </span>
              ) : (
                <ArrowRight className="absolute w-7 -translate-x-8 p-1 text-black/50 dark:text-white/50" />
              )}
              {isMultiline ? (
                props.children
              ) : (
                <p className={style.paragraph}>{props.children}</p>
              )}
            </li>
          );
        },

        aside({ node, title, ...props }) {
          const id = useId();
          const className = twJoin(
            "flex flex-col items-center justify-center w-full gap-4 p-4 pl-5 sm:p-8",
            "rounded-lg sm:rounded-xl !rounded-l relative overflow-hidden",
            "!max-w-[832px] [&>*]:max-w-3xl [&>*]:w-full",
            "before:absolute before:top-0 before:left-0 before:bottom-0 before:w-1",

            "data-[type=danger]:bg-red-100/70",
            "data-[type=danger]:dark:bg-red-700/20",
            "data-[type=danger]:before:bg-red-600",

            "data-[type=warn]:bg-amber-100",
            "data-[type=warn]:dark:bg-amber-800/20",
            "data-[type=warn]:before:bg-amber-500",
            "data-[type=warn]:before:dark:bg-yellow-600",

            "data-[type=note]:bg-blue-50/70",
            "data-[type=note]:dark:bg-blue-900/20",
            "data-[type=note]:before:bg-blue-600",
            props.className,
          );
          if (!title) {
            return <div {...props} className={className} />;
          }
          return (
            <aside {...props} className={className} aria-labelledby={id}>
              <p className={style.paragraph}>
                <strong id={id} className="font-semibold dark:text-white">
                  {title}
                </strong>
              </p>
              {props.children}
            </aside>
          );
        },

        figure({ node, ...props }) {
          const className = twJoin(
            "group gap-2 flex-col grid-cols-1 sm:grid-cols-2 overflow-hidden rounded-lg md:rounded-xl",
            "[&>img]:!rounded-none",
            "data-[wide]:!max-w-5xl data-[wide]:md:rounded-2xl",
            "data-[media]:grid",
            "data-[quote]:flex data-[quote]:!max-w-[736px]",
            "data-[bigquote]:flex data-[bigquote]:!w-auto data-[bigquote]:p-4",
            props.className,
          );
          return <figure {...props} className={className} />;
        },

        blockquote({ node, ...props }) {
          const className = twJoin(
            "flex flex-col gap-4 px-4 !max-w-[736px] border-l-4 border-black/25 dark:border-white/25",
            "group-data-[bigquote]:border-0",
            "group-data-[bigquote]:italic",
            "group-data-[bigquote]:p-0",
            "group-data-[bigquote]:text-lg",
            "group-data-[bigquote]:sm:text-xl",
            "group-data-[bigquote]:md:text-2xl",
            "group-data-[bigquote]:opacity-75",
            props.className,
          );
          return <blockquote {...props} className={className} />;
        },

        pre({ node, ...props }) {
          const pre = (
            <pre
              {...props}
              className={twJoin(
                "data-[api]:leading-8 data-[api]:tracking-wide data-[api]:text-black/60 dark:data-[api]:text-white/60",
                props.className,
              )}
            />
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

        p({ node, ...props }) {
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

        kbd({ node, ...props }) {
          const className = twJoin(
            "font-monospace rounded-[0.2667em] rounded-b-[0.3334em] border-b-[0.1334em] border-t-[0.0667em] border-b-black/[7.5%] border-t-white bg-gradient-to-b from-black/[15%] to-black/5 p-[0.1334em] px-[0.2667em] text-[0.9375em] [box-shadow:0_0_0_max(1px,0.033333em)_rgba(0,0,0,0.25)] dark:rounded-b-[0.4em] dark:border-b-[0.2em] dark:border-t-0 dark:border-b-black/40 dark:from-white/10 dark:to-white/[15%] dark:[box-shadow:0_min(-1px,-0.0666em)_rgba(255,255,255,0.1),0_0_0_max(1px,0.0666em)_rgba(255,255,255,0.15)]",
            props.className,
          );
          return <kbd {...props} className={className} />;
        },

        strong({ node, ...props }) {
          const className = twJoin(
            "font-semibold dark:text-white",
            props.className,
          );
          return <strong {...props} className={className} />;
        },

        a({ node, href, ...props }) {
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
          href = href?.replace(/^https:\/\/(www\.)?ariakit.org/, "");
          if (href?.startsWith("http")) {
            return (
              <InlineLink
                {...props}
                href={href}
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                {props.children}
                <NewWindow className="mb-0.5 ml-0.5 inline h-[1em] w-[1em] stroke-black/60 dark:stroke-white/60" />
              </InlineLink>
            );
          }
          if (href?.startsWith("/apis")) {
            return <span>{props.children}</span>;
          }
          if (href?.startsWith("#")) {
            return (
              <InlineLink {...props} href={href}>
                <Hashtag className="mb-0.5 inline h-[1em] w-[1em] stroke-black/60 dark:stroke-white/60" />
                {props.children}
              </InlineLink>
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
              const className = twMerge(
                "decoration-dotted hover:decoration-solid",
                hash
                  ? isHook
                    ? "text-[#000f80] dark:text-[#9cdcfe]"
                    : "text-[#ce0000] dark:text-[#9cdcfe]"
                  : isComponent
                  ? "text-[#227289] dark:text-[#4ec9b0]"
                  : "text-[#795e26] dark:text-[#dcdcaa]",
                props.className,
              );
              return (
                <InlineLink
                  {...props}
                  className={className}
                  render={<PreviewLink href={href} />}
                />
              );
            }
            return <InlineLink {...props} render={<Link href={href} />} />;
          }
          return <InlineLink {...props} />;
        },

        img({ node, src, alt, width, height, placeholder, ...props }) {
          const className = twJoin(style.media, props.className);
          return (
            <Image
              src={src!}
              alt={alt!}
              width={+width!}
              height={+height!}
              {...props}
              className={className}
            />
          );
        },

        video({ node, ...props }) {
          const className = twJoin(style.media, props.className);
          return <PageVideo {...props} className={className} />;
        },
      }}
    >
      {contentWithoutMatter}
    </ReactMarkdown>
  );

  cacheMap.set(cacheId, element);

  return wrapWithSection(element, section);
}
