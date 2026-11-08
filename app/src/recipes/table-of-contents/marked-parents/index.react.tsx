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
  { slug: "getting-started", title: "Getting started" },
  {
    slug: "projects",
    title: "Projects",
    children: [
      { slug: "members", title: "Members" },
      {
        slug: "environments",
        title: "Environments",
        children: [
          { slug: "variables", title: "Variables" },
          { slug: "domains", title: "Domains" },
        ],
      },
    ],
  },
  {
    slug: "billing",
    title: "Billing",
    children: [
      { slug: "plans", title: "Plans" },
      { slug: "invoices", title: "Invoices" },
    ],
  },
  { slug: "support", title: "Support" },
];

const text =
  "Open this page from the settings of your workspace. Changes apply to the whole workspace, and only its owners can make them.";

const details =
  "Each change appears in the activity log with its author and its date. Members get an email when a change affects their access.";

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
        <TocLink key={item.slug} href={href} $selectedBold>
          {item.title}
        </TocLink>
      );
    }
    return (
      <TocItem key={item.slug}>
        {/* Full ink and bold mark this link while its nested rows hold the
            current link, so the reader sees each level of the path. */}
        <TocLink href={href} $selectedBold $parentInk={100} $parentBold>
          {item.title}
        </TocLink>
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
          <Prose className="text-[clamp(0.625rem,2.5cqi,1rem)]">
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
          <Toc label="On this page" $cover>
            <Rows items={sections} />
          </Toc>
        </ShellSidebarBody>
      </ShellSidebar>
    </Shell>
  );
}
