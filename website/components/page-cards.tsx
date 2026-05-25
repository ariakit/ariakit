import type { Element } from "hast";
import type { ComponentProps, ReactNode } from "react";
import { Children, isValidElement } from "react";
import { twJoin } from "tailwind-merge";
import pageIndex from "@/build-pages/index.ts";
import { getPageIcon } from "@/lib/get-page-icon.tsx";
import { InlineLink } from "./inline-link.tsx";
import { PageItem } from "./page-item.tsx";

function findCardLinks(children: ReactNode): string[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ href?: unknown; children?: ReactNode }>(child)) {
      return [];
    }
    const { href, children } = child.props;
    if (typeof href === "string") return [href];
    if (children) return findCardLinks(children);
    return [];
  });
}

export interface PageCardsProps extends ComponentProps<"div"> {
  node?: Element;
  category?: string;
  page?: string;
  title?: string;
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
    const url = new URL(link, "https://ariakit.com");
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
          "z-[1] grid max-w-[calc(var(--size-content-box)+1.5rem)] grid-cols-1 gap-4 md:grid-cols-2 [[data-dialog]_&]:grid-cols-1",
        )}
      >
        {pages.map((page) => (
          <PageItem
            key={page.slug}
            href={`/${page.category}/${page.slug}`}
            title={page.title}
            description={page.content}
            thumbnail={getPageIcon(page.category, page.slug) || <span />}
            plus={page.tags.includes("Plus")}
          />
        ))}
      </div>
      {isExamples && (
        <div className="max-w-(--size-content)">
          <InlineLink
            href={`/examples${isComponentPage && page ? `#${page}` : ""}`}
          >
            View all
            {isComponentPage && title ? ` ${title}` : ""} examples
          </InlineLink>
        </div>
      )}
      {isComponents && (
        <div className="max-w-(--size-content)">
          <InlineLink href="/components">View all components</InlineLink>
        </div>
      )}
    </>
  );
}
