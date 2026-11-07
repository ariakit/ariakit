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
  { slug: "welcome", title: "Welcome" },
  {
    slug: "first-week",
    title: "Your first week",
    children: [
      { slug: "accounts", title: "Accounts" },
      {
        slug: "equipment",
        title: "Equipment",
        children: [
          { slug: "laptops", title: "Laptops" },
          { slug: "home-office", title: "Home office" },
        ],
      },
    ],
  },
  {
    slug: "working-together",
    title: "Working together",
    children: [
      { slug: "meetings", title: "Meetings" },
      { slug: "time-off", title: "Time off" },
    ],
  },
  { slug: "getting-help", title: "Getting help" },
];

const text =
  "This handbook explains how the team works and where to find things. Read it in any order, and ask in the team channel when something is missing.";

const details =
  "Anyone on the team can suggest a change to these pages. Keep each page short, and link to the tool or the form that it talks about.";

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
          {/* One straight line runs along the rows of every level, and only the
              rows indent. */}
          <Toc label="On this page" $guide="rail" $cover>
            <Rows items={sections} />
          </Toc>
        </ShellSidebarBody>
      </ShellSidebar>
    </Shell>
  );
}
