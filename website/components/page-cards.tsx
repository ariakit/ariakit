import { Children, isValidElement } from "react";
import type { ComponentProps, ReactNode } from "react";
import pageIndex from "build-pages/index.js";
import type { Element } from "hast";
import Link from "next/link.js";
import { twJoin } from "tailwind-merge";
import { getPageIcon } from "utils/get-page-icon.jsx";
import { InlineLink } from "./inline-link.jsx";
import { PageItem } from "./page-item.jsx";

function findCardLinks(children: ReactNode): string[] {
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

export interface PageCardsProps extends ComponentProps<"div"> {
  node?: Element;
  category: string;
  page: string;
  title?: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  type?: "components" | "examples" | (string & {});
}

export function PageCards({
  node,
  category,
  page,
  title,
  type,
  children,
  ...props
}: PageCardsProps) {
  const links = findCardLinks(children);

  const pages = links.flatMap((link) => {
    const url = new URL(link, "https://ariakit.org");
    const [, category, slug] = url.pathname.split("/");
    if (!category || !slug) return [];
    const page = pageIndex[category]?.find((item) => item.slug === slug);
    return page || [];
  });

  const isComponents = type === "components";
  const isExamples = type === "examples";
  const isComponentPage = category === "components";

  return (
    <>
      <div
        {...props}
        className={twJoin(
          props.className,
          "z-[1] grid !max-w-[792px] grid-cols-1 gap-4 md:grid-cols-2 [[data-dialog]_&]:grid-cols-1",
        )}
      >
        {pages.map((page) => (
          <PageItem
            key={page.slug}
            href={`/${page.category}/${page.slug}`}
            title={page.title}
            description={page.content}
            thumbnail={getPageIcon(page.category, page.slug) || <span />}
            plus={page.tags.includes("New")}
          />
        ))}
      </div>
      {isExamples && (
        <div className="flex justify-center">
          <InlineLink
            render={
              <Link href={`/examples${isComponentPage ? `#${page}` : ""}`} />
            }
          >
            View all
            {isComponentPage && title ? ` ${title}` : ""} examples
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
