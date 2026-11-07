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
  { slug: "summary", title: "Summary" },
  {
    slug: "data-we-collect",
    title: "Data we collect",
    children: [
      { slug: "account-data", title: "Account data" },
      {
        slug: "usage-data",
        title: "Usage data",
        children: [
          { slug: "logs", title: "Logs" },
          { slug: "cookies", title: "Cookies" },
        ],
      },
    ],
  },
  {
    slug: "your-choices",
    title: "Your choices",
    children: [
      { slug: "export", title: "Export your data" },
      { slug: "delete", title: "Delete your account" },
    ],
  },
  { slug: "contact", title: "Contact" },
];

const text =
  "This section says what the service does with your information and why. Changes to it appear here at least thirty days before they take effect.";

const details =
  "The service keeps this information only as long as it needs it. After that, the information is deleted or made anonymous within ninety days.";

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
          {/* Without a guide, there is no thumb, and only the current link
              shows where the reader is. */}
          <Toc label="On this page" $guide={false} $cover>
            <Rows items={sections} />
          </Toc>
        </ShellSidebarBody>
      </ShellSidebar>
    </Shell>
  );
}
