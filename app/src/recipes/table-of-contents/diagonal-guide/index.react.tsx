import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellMain,
  ShellMainBody,
  ShellSidebar,
  ShellSidebarBody,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  Toc,
  TocItem,
  TocLink,
  TocList,
} from "@ariakit/ui/components/toc.ariakit.react";
import { Fragment } from "react";

interface Section {
  slug: string;
  title: string;
  children?: Section[];
}

const sections: Section[] = [
  { slug: "introduction", title: "Introduction" },
  {
    slug: "requests",
    title: "Requests",
    children: [
      { slug: "authentication", title: "Authentication" },
      {
        slug: "pagination",
        title: "Pagination",
        children: [
          { slug: "cursors", title: "Cursors" },
          { slug: "page-size", title: "Page size" },
        ],
      },
    ],
  },
  {
    slug: "responses",
    title: "Responses",
    children: [
      { slug: "status-codes", title: "Status codes" },
      { slug: "errors", title: "Errors" },
    ],
  },
  { slug: "rate-limits", title: "Rate limits" },
];

const text =
  "Every endpoint follows the same rules, so a client can handle them in one place. Each response also tells the client how to make the next request.";

const details =
  "Clients should treat unknown fields as optional, because new fields can appear at any time. Removed fields stay in place for one major version.";

function Article({ items, level }: { items: Section[]; level: number }) {
  const render = level === 2 ? <h2 /> : level === 3 ? <h3 /> : <h4 />;
  return items.map((item) => (
    <Fragment key={item.slug}>
      <Heading id={item.slug} render={render}>
        <a href={`#${item.slug}`}>{item.title}</a>
      </Heading>
      <p>{text}</p>
      <p>{details}</p>
      {item.children && <Article items={item.children} level={level + 1} />}
    </Fragment>
  ));
}

function Rows({ items }: { items: Section[] }) {
  return items.map((item) => {
    const href = `#${item.slug}`;
    if (!item.children) {
      return (
        <TocLink key={item.slug} href={href}>
          {item.title}
        </TocLink>
      );
    }
    return (
      <TocItem key={item.slug}>
        <TocLink href={href}>{item.title}</TocLink>
        <TocList>
          <Rows items={item.children} />
        </TocList>
      </TocItem>
    );
  });
}

export default function Example() {
  return (
    <Shell>
      <ShellMain>
        <ShellMainBody>
          {/* The article text gets smaller in a narrow frame, so the sidebar
              keeps its room beside it. */}
          <Prose className="text-[length:clamp(0.625rem,2.5cqi,1rem)]">
            <Article items={sections} level={2} />
          </Prose>
        </ShellMainBody>
      </ShellMain>
      <ShellSidebar
        $side="end"
        $show
        $from="body"
        $border={false}
        $layer="transparent"
      >
        <ShellSidebarBody>
          {/* The guide bends into each nested list with a slanted line. */}
          <Toc label="On this page" $guide="diagonal" $cover>
            <Rows items={sections} />
          </Toc>
        </ShellSidebarBody>
      </ShellSidebar>
    </Shell>
  );
}
