import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import type { TocProps } from "@ariakit/ui/components/toc.ariakit.react";
import {
  Toc,
  TocItem,
  TocLink,
  TocList,
} from "@ariakit/ui/components/toc.ariakit.react";
import { Fragment, useState } from "react";

interface Entry {
  slug: string;
  text: string;
  ordered?: boolean;
  marker?: "bullet";
  children?: Entry[];
}

// Only the rows of the nested list get numbers, including a row with an
// unnumbered list of its own.
const numberedSteps: Entry[] = [
  { slug: "numbered-overview", text: "Overview" },
  {
    slug: "numbered-guide",
    text: "Guide",
    ordered: true,
    children: [
      { slug: "numbered-install", text: "Install" },
      {
        slug: "numbered-configure",
        text: "Configure",
        children: [{ slug: "numbered-theme", text: "Theme" }],
      },
      { slug: "numbered-deploy", text: "Deploy" },
    ],
  },
  { slug: "numbered-faq", text: "FAQ" },
];

// Only the rows of the nested list get dots, including a row with a list of its
// own without dots.
const dotSteps: Entry[] = [
  { slug: "dot-overview", text: "Overview" },
  {
    slug: "dot-guide",
    text: "Guide",
    marker: "bullet",
    children: [
      { slug: "dot-install", text: "Install" },
      {
        slug: "dot-configure",
        text: "Configure",
        children: [{ slug: "dot-theme", text: "Theme" }],
      },
      { slug: "dot-deploy", text: "Deploy" },
    ],
  },
  { slug: "dot-faq", text: "FAQ" },
];

// Two-digit numbers fill the markers of an ordered table of contents.
const chapters: Entry[] = Array.from({ length: 12 }, (_, index) => ({
  slug: `chapter-${index + 1}`,
  text: `Chapter ${index + 1}`,
}));

function Entries({ entries }: { entries: Entry[] }) {
  return entries.map((entry) => {
    const href = `#${entry.slug}`;
    if (!entry.children?.length) {
      return (
        <TocLink key={entry.text} href={href}>
          {entry.text}
        </TocLink>
      );
    }
    return (
      <TocItem key={entry.text}>
        <TocLink href={href}>{entry.text}</TocLink>
        <TocList ordered={entry.ordered} $marker={entry.marker}>
          <Entries entries={entry.children} />
        </TocList>
      </TocItem>
    );
  });
}

function Sections({ entries }: { entries: Entry[] }) {
  return entries.map((entry) => (
    <Fragment key={entry.slug}>
      <Heading id={entry.slug} render={<h2 />} $level={5}>
        {entry.text}
      </Heading>
      <p>Scroll the article to move the marks of every table of contents.</p>
      {entry.children && <Sections entries={entry.children} />}
    </Fragment>
  ));
}

function Contents({
  entries,
  ...props
}: { entries: Entry[] } & Omit<TocProps, "children">) {
  return (
    <Toc className="w-48" {...props}>
      <Entries entries={entries} />
    </Toc>
  );
}

// The dots show without a change in the rows, so nothing else measures them.
function DotsShownLater() {
  const [shown, setShown] = useState(false);
  const entries = dotSteps.map((entry) => {
    return shown ? entry : { ...entry, marker: undefined };
  });
  return (
    <div className="grid content-start gap-3">
      <Button aria-pressed={shown} onClick={() => setShown(!shown)}>
        Show dots
      </Button>
      <Contents label="Dots shown later" entries={entries} />
    </div>
  );
}

export default function Example() {
  return (
    <div className="grid w-full max-w-5xl gap-6">
      <Frame
        render={<article aria-label="Article" />}
        $layer
        $border
        $rounded="xl"
        $p={5}
        className="h-48 overflow-auto scroll-pt-5"
      >
        <Prose>
          <Sections entries={[...numberedSteps, ...dotSteps, ...chapters]} />
        </Prose>
      </Frame>
      <div className="flex flex-wrap items-start gap-6">
        <Contents label="Numbered steps" entries={numberedSteps} />
        <Contents
          label="Numbered steps, diagonal"
          entries={numberedSteps}
          $guide="diagonal"
        />
        <Contents
          label="Numbered steps, rail"
          entries={numberedSteps}
          $guide="rail"
        />
        <Contents
          label="Numbered steps, indent only"
          entries={numberedSteps}
          $guide={false}
        />
        <Contents
          label="Chapters, indent only"
          entries={chapters}
          ordered
          $guide={false}
        />
        <Contents label="Dot steps" entries={dotSteps} />
        <Contents
          label="Dot steps, diagonal"
          entries={dotSteps}
          $guide="diagonal"
        />
        <Contents label="Dot steps, rail" entries={dotSteps} $guide="rail" />
        <Contents
          label="Dot steps, wide bar"
          entries={dotSteps}
          $barWidth={3}
        />
        <div dir="rtl" className="flex flex-wrap items-start gap-6">
          <Contents
            label="Right to left, numbered steps"
            entries={numberedSteps}
          />
          <Contents label="Right to left, dot steps" entries={dotSteps} />
        </div>
        <DotsShownLater />
      </div>
    </div>
  );
}
