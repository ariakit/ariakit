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
  children: { slug: string; title: string }[];
}

const sections: Section[] = [
  {
    slug: "overview",
    title: "Overview",
    children: [],
  },
  {
    slug: "examples",
    title: "Examples",
    children: [
      { slug: "basic-tabs", title: "Basic tabs" },
      { slug: "vertical-tabs", title: "Vertical tabs" },
      { slug: "scrollable-tabs", title: "Scrollable tabs" },
      { slug: "closable-tabs", title: "Closable tabs" },
    ],
  },
  {
    slug: "styling",
    title: "Styling",
    children: [
      { slug: "active-tab", title: "Active tab" },
      { slug: "tab-panels", title: "Tab panels" },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    children: [],
  },
];

const text =
  "Tabs show one panel at a time and keep the other panels a click away. The arrow keys move between the tabs, and each panel keeps its state while it's hidden.";

const details =
  "Use tabs for content at the same level, such as views of one record. For steps that depend on each other, a guided flow fits better.";

export default function Example() {
  return (
    <Shell>
      <ShellMain>
        <ShellMainBody>
          {/* The article text gets smaller in a narrow frame, so the sidebar
              keeps its room beside it. */}
          <Prose className="text-[clamp(0.625rem,2.5cqi,1rem)]">
            {sections.map((section) => (
              <Fragment key={section.slug}>
                <Heading id={section.slug} render={<h2 />}>
                  <a href={`#${section.slug}`}>{section.title}</a>
                </Heading>
                <p>{text}</p>
                <p>{details}</p>
                {section.children.map((child) => (
                  <Fragment key={child.slug}>
                    <Heading id={child.slug} render={<h3 />}>
                      <a href={`#${child.slug}`}>{child.title}</a>
                    </Heading>
                    <p>{text}</p>
                    <p>{details}</p>
                  </Fragment>
                ))}
              </Fragment>
            ))}
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
            {sections.map((section) => {
              const href = `#${section.slug}`;
              if (!section.children.length) {
                return (
                  <TocLink key={section.slug} href={href}>
                    {section.title}
                  </TocLink>
                );
              }
              return (
                <TocItem key={section.slug}>
                  <TocLink href={href}>{section.title}</TocLink>
                  {/* A dot marks each nested row and fills while the bar
                      covers it. The dots fit in the regular guide offset, and
                      the list stays unordered. */}
                  <TocList $marker="bullet">
                    {section.children.map((child) => (
                      <TocLink key={child.slug} href={`#${child.slug}`}>
                        {child.title}
                      </TocLink>
                    ))}
                  </TocList>
                </TocItem>
              );
            })}
          </Toc>
        </ShellSidebarBody>
      </ShellSidebar>
    </Shell>
  );
}
