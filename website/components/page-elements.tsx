import type { Element, ElementContent } from "hast";
import Image from "next/image.js";
import Link from "next/link.js";
import type { ComponentPropsWithoutRef } from "react";
import { Children, cloneElement, isValidElement, useId } from "react";
import { twJoin, twMerge } from "tailwind-merge";
import invariant from "tiny-invariant";
import pageLinks from "@/build-pages/links.ts";
import type { PageIndexDetail, TableOfContents } from "@/build-pages/types.ts";
import { ArrowRight } from "@/icons/arrow-right.tsx";
import { Hashtag } from "@/icons/hashtag.tsx";
import { NewWindow } from "@/icons/new-window.tsx";
import { isValidHref } from "@/lib/is-valid-href.ts";
import {
  AuthDisabled,
  AuthEnabled,
  AuthLoading,
  NotSubscribed,
  Subscribed,
} from "./auth.tsx";
import { Command } from "./command.tsx";
import { InlineLink } from "./inline-link.tsx";
import { PageCards } from "./page-cards.tsx";
import { PageHeroProvider } from "./page-context.tsx";
import { PageExample } from "./page-example.tsx";
import { PageHovercardAnchor } from "./page-hovercard.tsx";
import { PageSidebar } from "./page-sidebar.tsx";
import { PageTag, PageTagList } from "./page-tag.tsx";

export interface PageHeadingProps extends ComponentPropsWithoutRef<"h1"> {
  node?: Element;
  level: number;
}

export function PageHeading({ node, level, ...props }: PageHeadingProps) {
  const className = twJoin(
    // base styles
    "text-black text-pretty dark:text-white tracking-[-0.035em] dark:tracking-[-0.015em]",
    "[&_code]:font-monospace [&_code]:rounded [&_code]:px-[0.2em] [&_code]:py-[0.15em]",
    "[&_code]:bg-black/[7.5%] dark:[&_code]:bg-white/[7.5%] max-w-[--size-content-box]",
    // sticky styles
    level < 4 && [
      "max-md:flex items-center z-20 top-[--header-height]",
      "max-md:sticky max-md:min-h-[48px] max-md:pb-2 max-md:-mb-2 max-md:pr-12",
      "max-md:-mx-[--page-padding] max-md:w-[calc(100%+var(--page-padding)*2)] max-md:px-[--page-padding]",
      "max-md:bg-gray-50 max-md:dark:bg-gray-800",
      "[[data-dialog]_&]:static [[data-dialog]_&]:mb-0 [[data-dialog]_&]:pb-0 [[data-dialog]_&]:bg-inherit",
    ],
    level === 1 &&
      "text-2xl font-extrabold dark:font-bold sm:text-3xl md:text-5xl [[data-dialog]_&]:text-2xl",
    level === 2 &&
      "text-xl font-semibold dark:font-medium sm:text-2xl md:text-3xl [&_code]:font-medium [[data-dialog]_&]:text-xl",
    level === 3 &&
      "text-lg font-semibold dark:font-medium sm:text-xl [[data-dialog]_&]:text-lg",
    level === 4 && "text-sm uppercase tracking-wider opacity-70",
    props.className,
  );

  if (level === 1) {
    return (
      <h1 {...props} className={className}>
        <span className="max-w-[--size-content]">{props.children}</span>
      </h1>
    );
  }

  if (level === 4) {
    return <h4 {...props} className={className} />;
  }

  const { id, ...rest } = props;
  const Element = level === 2 ? "h2" : "h3";

  return (
    <Element {...rest} className={className}>
      <a
        href={`#${id}`}
        className="decoration-1 underline-offset-[0.25em] [text-decoration-skip-ink:none] hover:underline"
      >
        {props.children}
      </a>
    </Element>
  );
}

export interface PageParagraphProps extends ComponentPropsWithoutRef<"p"> {
  node?: Element;
}

export function PageParagraph({ node, ...props }: PageParagraphProps) {
  const className = twJoin(
    "dark:text-white/[85%] leading-7",
    "max-w-[--size-content] text-pretty",
    "[p&_code]:rounded [p&_code]:text-[0.9375em] text-pretty",
    "[p&_code]:px-[0.25em] [p&_code]:py-[0.2em]",
    "[p&_code]:bg-black/[7.5%] dark:[p&_code]:bg-white/[7.5%]",
    "[p&_code]:font-monospace",
    props.className,
  );
  const paragraph = (
    <div className="max-w-[--size-content-box]">
      <p {...props} className={className} />
    </div>
  );
  const children = Children.toArray(props.children);

  if (children.length > 1) return paragraph;

  const [child] = children;
  if (!child) return paragraph;
  if (!isValidElement(child)) return paragraph;

  if (!child.props) return paragraph;

  if ("data-large" in child.props) return child;
  if (!("data-playground" in child.props)) return paragraph;
  if (!child.props.href) return paragraph;

  return <>{props.children}</>;
}

export interface PageAsideProps extends ComponentPropsWithoutRef<"div"> {
  node?: Element;
}

export function PageAside({ node, title, ...props }: PageAsideProps) {
  const id = useId();
  const className = twJoin(
    "flex flex-col items-start justify-center w-full gap-4 p-4 pl-5 sm:p-8",
    "rounded-lg sm:rounded-xl !rounded-l relative overflow-hidden",
    "max-w-[--size-lg] *:w-full",
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
      <PageParagraph id={id} className="w-full font-semibold dark:!text-white">
        {title}
      </PageParagraph>
      {props.children}
    </aside>
  );
}

export interface PageDescriptionProps extends ComponentPropsWithoutRef<"p"> {
  node?: Element;
}

export function PageDescription({
  node,
  children,
  ...props
}: PageDescriptionProps) {
  const [p, paragraph = p] = Children.toArray(children);

  invariant(
    isValidElement<ComponentPropsWithoutRef<"p">>(paragraph),
    "Expected paragraph",
  );

  return cloneElement(paragraph, {
    ...props,
    children: (
      <span className="block max-w-[--size-content]">
        {paragraph.props.children}
      </span>
    ),
    className: twJoin(
      "-translate-y-2 !max-w-[--size-content-box] [:has([data-call-to-action])_&]:md:grid grid-cols-[1fr_260px] w-full gap-4 md:gap-8 text-lg sm:text-xl sm:leading-8 text-black/70 dark:!text-white/60",
      paragraph.props.className,
      props.className,
    ),
  });
}

export interface PageDividerProps extends ComponentPropsWithoutRef<"hr"> {
  node?: Element;
}

export function PageDivider({ node, ...props }: PageDividerProps) {
  const className = twJoin(
    "w-full max-w-[--size-content] border-t border-black/10 dark:border-white/10",
    "[[data-dialog]_section:last-of-type_&]:hidden",
    props.className,
  );
  return <hr {...props} className={className} />;
}

export interface PageFigureProps extends ComponentPropsWithoutRef<"figure"> {
  node?: Element;
}

export function PageFigure({ node, ...props }: PageFigureProps) {
  const className = twJoin(
    "group gap-2 flex-col grid-cols-1 sm:grid-cols-2 overflow-hidden rounded-lg md:rounded-xl",
    "[&>img]:!rounded-none",
    "data-[wide]:max-w-[--size-xl] data-[wide]:md:rounded-2xl",
    "data-[media]:grid",
    "data-[quote]:flex data-[quote]:max-w-[--size-quote]",
    "data-[bigquote]:flex data-[bigquote]:!w-auto data-[bigquote]:p-4",
    props.className,
  );
  return <figure {...props} className={className} />;
}

export interface PageBlockquoteProps
  extends ComponentPropsWithoutRef<"blockquote"> {
  node?: Element;
}

export function PageBlockquote({ node, ...props }: PageBlockquoteProps) {
  const className = twJoin(
    "flex flex-col gap-4 px-4 max-w-[--size-quote] border-l-4 border-black/25 dark:border-white/25",
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
}

export interface PageListProps extends ComponentPropsWithoutRef<"ol"> {
  node?: Element;
  ordered?: boolean;
}

export function PageList({ node, ordered, ...props }: PageListProps) {
  const className = twJoin(
    "flex flex-col gap-4 pl-8 list-none w-full max-w-[--size-content]",
    props.className,
  );
  const Element = ordered ? "ol" : "ul";
  return (
    <div className="max-w-[--size-content-box]">
      <Element {...props} className={className} />
    </div>
  );
}

export interface PageListItemProps extends ComponentPropsWithoutRef<"li"> {
  node?: Element;
  ordered?: boolean;
  index?: number;
  multiline?: boolean;
}

export function PageListItem({
  node,
  index,
  ordered,
  multiline,
  ...props
}: PageListItemProps) {
  const isMultiline =
    multiline ?? Children.toArray(props.children).at(0) === "\n";
  const className = twJoin(
    "relative flex flex-col",
    ordered ? "gap-4" : "gap-2",
    ordered &&
      isMultiline &&
      "before:absolute before:top-9 before:-left-5 before:w-px before:h-[calc(100%-theme(spacing.7))] before:bg-black/10 dark:before:bg-white/10",
    props.className,
  );
  return (
    <li {...props} className={className}>
      {ordered ? (
        <span className="absolute flex size-6 -translate-x-8 translate-y-0.5 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
          {(index || 0) + 1}
        </span>
      ) : (
        <ArrowRight className="absolute w-7 -translate-x-8 p-1.5 text-black/50 dark:text-white/50" />
      )}
      {isMultiline ? (
        props.children
      ) : (
        <PageParagraph>{props.children}</PageParagraph>
      )}
    </li>
  );
}

export interface PageSectionProps extends ComponentPropsWithoutRef<"section"> {
  level?: number;
  plus?: boolean;
  media?: PageIndexDetail["media"];
  tableOfContents?: TableOfContents;
}

export function PageSection({
  level,
  plus,
  media,
  tableOfContents,
  ...props
}: PageSectionProps) {
  level =
    level ??
    ("data-level" in props
      ? Number.parseInt(props["data-level"] as string, 10)
      : undefined);

  const section = (
    <section
      data-level={level}
      {...props}
      className={twJoin(
        "flex w-full flex-col items-center justify-center gap-8 [[data-dialog]_&]:gap-5",
        "scroll-mt-16 *:w-full md:scroll-mt-24",
        `data-[level="1"]:mt-0 data-[level="2"]:mt-6 data-[level="3"]:mt-2`,
        "[[data-dialog]_&]:first-of-type:mt-0 [[data-dialog]_&]:data-[level='2']:mt-2",
        "[[data-dialog]_&]:bg-inherit",
        level === 1
          ? "[--size-2xl:--size-wide] [--size-content-box:--size-md] [--size-lg:--size-4xl] [--size-md:--size-3xl] [--size-xl:--size-5xl]"
          : "",
        props.className,
      )}
    />
  );

  if (plus) {
    if (level && level > 1 && props.id !== "related-examples") {
      return (
        <AuthEnabled>
          <Subscribed>{section}</Subscribed>
        </AuthEnabled>
      );
    }

    if (level === 1) {
      tableOfContents = tableOfContents?.filter(
        (item, index) =>
          index !== 0 &&
          !["Components", "Related examples"].includes(item.text),
      );
      return (
        <PageHeroProvider>
          {section}
          {!!tableOfContents?.length && (
            <AuthEnabled>
              <NotSubscribed>
                <div className="mt-12 flex w-full flex-col items-start justify-center md:flex-row">
                  <div className="flex w-full min-w-[1px] max-w-5xl flex-col items-center gap-8 md:px-[--page-padding]">
                    <PageSection level={2} id="learn-more-about-this-example">
                      <PageHeading level={2} id="learn-more-about-this-example">
                        Learn more about this example
                      </PageHeading>
                      <PageParagraph>
                        This is a new example exclusive to Ariakit Plus
                        subscribers. In addition to gaining access to the
                        complete source code above, you will also have the
                        opportunity to delve deeper into this example through
                        the following topics:
                      </PageParagraph>
                      <PageList ordered={false}>
                        {tableOfContents.map((item, index) => (
                          <PageListItem
                            key={item.id}
                            index={index}
                            ordered={false}
                          >
                            <PageStrong>{item.text}</PageStrong>
                          </PageListItem>
                        ))}
                      </PageList>
                      <div className="max-w-[--size-content-box]">
                        <div className="max-w-[--size-content]">
                          <Command
                            variant="plus"
                            className="h-14 text-lg focus-visible:!ariakit-outline"
                            render={
                              <Link
                                href="/plus?feature=examples"
                                scroll={false}
                              />
                            }
                          >
                            Unlock Ariakit Plus
                          </Command>
                        </div>
                      </div>
                    </PageSection>
                  </div>
                  <div className="my-4 flex w-full gap-4 md:mx-4 md:w-60 md:flex-col">
                    {/* {media?.slice(0, 3).map((item) => {
                      if (item.type === "image") {
                        return (
                          <PageImage
                            key={item.src}
                            {...item}
                            className="aspect-square rounded-md object-cover"
                          />
                        );
                      }
                      return null;
                    })} */}
                  </div>
                </div>
              </NotSubscribed>
            </AuthEnabled>
          )}
        </PageHeroProvider>
      );
    }
  }

  if (level === 1) {
    return <PageHeroProvider>{section}</PageHeroProvider>;
  }

  return section;
}

export interface PageDivProps extends ComponentPropsWithoutRef<"div"> {
  node?: Element;
  tags?: string[];
  media?: PageIndexDetail["media"];
  category?: string;
  page?: string;
  title?: string;
  tableOfContents?: TableOfContents;
}

export function PageDiv({
  node,
  category,
  page,
  title,
  tags = [],
  media = [],
  tableOfContents,
  ...props
}: PageDivProps) {
  if (node?.properties?.dataLevel) {
    return (
      <PageSection
        {...props}
        media={media}
        plus={tags.includes("Plus")}
        tableOfContents={tableOfContents}
      />
    );
  }
  if (node?.properties?.dataSections != null && props.children) {
    const sidebarPlaceholder = <div className="m-4 w-60 flex-none" />;
    const sidebar = tableOfContents && (
      <PageSidebar tableOfContents={tableOfContents} />
    );
    return (
      <div
        {...props}
        className={twJoin(
          "flex w-full flex-col items-start justify-center md:mt-12 md:flex-row-reverse [[data-dialog]_&]:!mt-0",
          props.className,
        )}
      >
        {tags.includes("Plus") ? (
          <>
            <AuthEnabled>
              <AuthLoading>{sidebarPlaceholder}</AuthLoading>
              <NotSubscribed>{sidebarPlaceholder}</NotSubscribed>
              <Subscribed>
                {tableOfContents ? sidebar : sidebarPlaceholder}
              </Subscribed>
            </AuthEnabled>
            <AuthDisabled>{sidebarPlaceholder}</AuthDisabled>
          </>
        ) : (
          sidebar
        )}
        <div className="flex w-full min-w-[1px] max-w-5xl flex-col items-center gap-8 md:px-[--page-padding] [[data-dialog]_&]:!px-0">
          {props.children}
        </div>
      </div>
    );
  }
  if (node?.properties?.dataDescription != null) {
    return <PageDescription {...props} />;
  }
  if (node?.properties?.dataTags != null) {
    if (!tags.length) return null;
    return (
      <PageTagList {...props}>
        {tags.map((tag) => (
          <PageTag key={tag} tag={tag} />
        ))}
      </PageTagList>
    );
  }
  if (node?.properties?.dataCards != null) {
    const type = node.properties.dataCards.toString();
    return (
      <PageCards
        {...props}
        type={type}
        category={category}
        page={page}
        title={title}
      />
    );
  }
  return <div {...props} />;
}

export interface PageKbdProps extends ComponentPropsWithoutRef<"kbd"> {
  node?: Element;
}

export function PageKbd({ node, ...props }: PageKbdProps) {
  const className = twJoin(
    "font-[inherit] px-[0.2667em] p-[0.1334em]",
    "rounded-[0.2667em] rounded-b-[0.3334em] border-b-[0.1334em] border-t-[0.0667em] border-b-black/[7.5%] border-t-white",
    "dark:border-b-[0.2em] dark:border-t-0 dark:border-b-black/40 dark:rounded-b-[0.4em]",
    "bg-gradient-to-b from-black/[15%] to-black/5 dark:from-white/10 dark:to-white/[15%]",
    "[box-shadow:0_0_0_max(1px,0.033333em)_rgba(0,0,0,0.25)]",
    "dark:[box-shadow:0_min(-1px,(-0.0666em))_rgba(255,255,255,0.1),0_0_0_max(1px,0.0666em)_rgba(255,255,255,0.15)]",
    props.className,
  );
  return <kbd {...props} className={className} />;
}

export interface PageStrongProps extends ComponentPropsWithoutRef<"strong"> {
  node?: Element;
}

export function PageStrong({ node, ...props }: PageStrongProps) {
  const isBreaking = Children.toArray(props.children).at(0) === "BREAKING";
  const className = twJoin(
    "font-semibold dark:text-white",
    isBreaking &&
      "px-[0.2667em] p-[0.1334em] text-white bg-red-700 rounded-[0.2667em] text-sm mx-[0.1334em]",
    props.className,
  );
  return <strong {...props} className={className} />;
}

export interface PageImageProps extends ComponentPropsWithoutRef<"img"> {
  node?: Element;
}

export function PageImage({
  node,
  src,
  alt,
  width,
  height,
  ...props
}: PageImageProps) {
  const className = twJoin(
    "overflow-hidden rounded-lg max-w-[--size-md] data-[large]:max-w-[--size-lg] data-[wide]:max-w-[--size-xl] md:rounded-xl data-[wide]:md:rounded-2xl",
    props.className,
  );
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
}

function getNodeText(node: Element | ElementContent): string {
  if ("children" in node) return node.children.map(getNodeText).join("");
  if ("value" in node) return node.value;
  return "";
}

export interface PageAProps extends ComponentPropsWithoutRef<"a"> {
  category?: string;
  page?: string;
  file?: string;
  node?: Element;
  hovercards?: Set<Promise<string | Iterable<string>>>;
  tags?: string[];
}

export function PageA({
  node,
  file,
  href,
  hovercards,
  tags,
  category: currentCategory,
  page: currentPage,
  ...props
}: PageAProps) {
  if ("data-playground" in props && href) {
    return (
      <PageExample
        pageFilename={file!}
        href={href}
        hovercards={hovercards}
        {...props}
        type={props.type as any}
        abstracted={tags?.includes("Abstracted examples")}
        plus={tags?.includes("Plus")}
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
        <span className="whitespace-nowrap">
          &#x2060;
          <NewWindow className="mb-0.5 ml-0.5 inline size-[1em] stroke-black/60 dark:stroke-white/60" />
        </span>
      </InlineLink>
    );
  }
  if (href?.startsWith("/apis")) {
    return <span>{props.children}</span>;
  }
  if (href?.startsWith("#")) {
    return (
      <InlineLink {...props} href={href}>
        <span className="whitespace-nowrap">
          <Hashtag className="mb-0.5 inline size-[1em] stroke-black/60 dark:stroke-white/60" />
          &#x2060;
        </span>
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
    if (category === "reference" && page && node) {
      if (
        currentCategory &&
        currentPage &&
        url.hash &&
        ((!page.endsWith("provider") && !page.endsWith("store")) ||
          currentPage.endsWith("provider") ||
          currentPage.endsWith("store")) &&
        isValidHref(`/${currentCategory}/${currentPage}${url.hash}`, pageLinks)
      ) {
        href = `/${currentCategory}/${currentPage}${url.hash}`;
      }
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
      hovercards?.add(Promise.resolve(href));
      return (
        <InlineLink
          {...props}
          className={className}
          render={<PageHovercardAnchor render={<Link href={href} />} />}
        />
      );
    }
    return <InlineLink {...props} render={<Link href={href} />} />;
  }
  return <InlineLink {...props} />;
}
