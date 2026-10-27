import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import type {
  TocLinkProps,
  TocProps,
} from "@ariakit/ui/components/toc.ariakit.react";
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
  children?: Entry[];
}

// Five levels, deeper than the three levels that the guide indents.
const deep: Entry[] = [
  { slug: "deep-overview", text: "Overview" },
  {
    slug: "deep-guides",
    text: "Guides",
    children: [
      {
        slug: "deep-start",
        text: "Getting started",
        children: [
          {
            slug: "deep-install",
            text: "Install",
            children: [
              {
                slug: "deep-pnpm",
                text: "With pnpm",
                children: [{ slug: "deep-workspace", text: "In a workspace" }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "deep-theming",
    text: "Theming",
    children: [{ slug: "deep-colors", text: "Colors" }],
  },
  { slug: "deep-faq", text: "FAQ" },
];

// Two-digit numbers fill the markers of an ordered table of contents.
const chapters: Entry[] = Array.from({ length: 12 }, (_, index) => ({
  slug: `chapter-${index + 1}`,
  text: `Chapter ${index + 1}`,
}));

const nested: Entry[] = [
  { slug: "rtl-overview", text: "نظرة عامة" },
  {
    slug: "rtl-usage",
    text: "الاستخدام",
    children: [
      { slug: "rtl-basic", text: "مثال بسيط" },
      { slug: "rtl-state", text: "الحالة المتحكم بها" },
    ],
  },
  { slug: "rtl-styling", text: "التنسيق" },
];

// Links to a heading that doesn't exist, a heading in hidden content, and the
// same heading twice. None of them can become current.
const uneven: Entry[] = [
  { slug: "deep-overview", text: "Overview" },
  { slug: "deep-missing", text: "Missing" },
  { slug: "deep-hidden", text: "Hidden" },
  { slug: "deep-guides", text: "Guides" },
  { slug: "deep-guides", text: "Guides again" },
  { slug: "deep-faq", text: "FAQ" },
];

// Links to headings that don't exist anywhere on the page.
const missing: Entry[] = [
  { slug: "missing-first", text: "First" },
  { slug: "missing-second", text: "Second" },
];

// Steps that fit in their panel until the details of the first step show.
const steps: Entry[] = [
  { slug: "step-first", text: "First step" },
  { slug: "step-second", text: "Second step" },
  { slug: "step-third", text: "Third step" },
];

type LinkProps = Omit<TocLinkProps, "href">;

function Entries({ entries, link }: { entries: Entry[]; link?: LinkProps }) {
  return entries.map((entry) => {
    const href = `#${entry.slug}`;
    if (!entry.children?.length) {
      return (
        <TocLink key={entry.text} href={href} {...link}>
          {entry.text}
        </TocLink>
      );
    }
    return (
      <TocItem key={entry.text}>
        <TocLink href={href} {...link}>
          {entry.text}
        </TocLink>
        <TocList>
          <Entries entries={entry.children} link={link} />
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
  link,
  ...props
}: { entries: Entry[]; link?: LinkProps } & Omit<TocProps, "children">) {
  return (
    <Toc className="w-48" {...props}>
      <Entries entries={entries} link={link} />
    </Toc>
  );
}

// The details grow the content of the panel without a scroll, and make the
// panel overflow, so it becomes the scroll container only after they show.
function GrowingSteps() {
  const [details, setDetails] = useState(false);
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Frame
        render={<article aria-label="Steps" />}
        $layer
        $border
        $rounded="xl"
        $p={5}
        className="h-64 w-96 overflow-auto scroll-pt-5"
      >
        <Prose>
          {steps.map((step, index) => (
            <Fragment key={step.slug}>
              <Heading id={step.slug} render={<h2 />} $level={5}>
                {step.text}
              </Heading>
              {index === 0 && (
                <Button
                  aria-expanded={details}
                  onClick={() => setDetails(!details)}
                >
                  Show details
                </Button>
              )}
              {index === 0 && details && (
                <>
                  <p>
                    Read the details before you start. They tell you what to
                    prepare, how long each step takes, and what to check when a
                    step is done.
                  </p>
                  <p>
                    Keep the details open while you work, and come back to them
                    when a step doesn't go as planned.
                  </p>
                  <p>
                    The next steps build on this one, so finish it before you
                    move on.
                  </p>
                </>
              )}
            </Fragment>
          ))}
        </Prose>
      </Frame>
      <Contents label="Steps" entries={steps} />
    </div>
  );
}

// The table of contents sits below the end of a box that scrolls. It has no
// headings to follow, so it leaves the box where it is.
function MissingTargets() {
  return (
    <div
      role="region"
      aria-label="Box with missing targets"
      className="h-24 w-56 overflow-y-auto"
    >
      <p className="h-40">The table of contents is below.</p>
      <Contents label="Missing targets" entries={missing} />
    </div>
  );
}

// The table of contents shows without an animation after the article scrolls,
// and its rows scroll by themselves to the sections on screen as it shows.
function ShownLater() {
  const [shown, setShown] = useState(false);
  return (
    <div className="grid content-start gap-3">
      <Button aria-expanded={shown} onClick={() => setShown(!shown)}>
        Show chapters
      </Button>
      <div hidden={!shown}>
        <Contents
          label="Chapters shown later"
          entries={chapters}
          list={{ className: "max-h-16 overflow-y-auto" }}
        />
      </div>
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
          <Sections entries={[...deep, ...chapters, ...nested]} />
          <div hidden>
            <Heading id="deep-hidden" render={<h2 />} $level={5}>
              Hidden
            </Heading>
          </div>
        </Prose>
      </Frame>
      <div className="flex flex-wrap items-start gap-6">
        <Contents label="Five levels" entries={deep} />
        <Contents
          label="Five levels, diagonal"
          entries={deep}
          $guide="diagonal"
        />
        <Contents label="Straight rail" entries={deep} $guide="rail" />
        <Contents label="Indent only" entries={deep} $guide={false} />
        <Contents
          label="Bold current link"
          entries={deep}
          link={{ $selectedBold: true }}
        />
        <Contents label="Twelve chapters" entries={chapters} ordered />
        <Contents
          label="Marked parents"
          entries={deep}
          link={{ $parentInk: 100, $parentBold: true }}
        />
        <Contents
          label="Numbers over the thumb"
          entries={chapters}
          ordered
          $markerRing={false}
        />
        {/* The rows scroll in their own box below the label, which is shorter
            than the rows of the sections on screen. */}
        <Contents
          label="Scrolling rows"
          entries={chapters}
          list={{ className: "max-h-16 overflow-y-auto" }}
        />
        {/* The table of contents scrolls with its label stuck at the top, and
            its scroll padding keeps the current link below the label. */}
        <Contents
          label={{
            children: "Sticky label",
            className: "sticky top-0 z-1 bg-(--ak-layer)",
          }}
          entries={chapters}
          className="max-h-48 w-48 scroll-pt-10 overflow-y-auto"
        />
        <div dir="rtl" className="flex flex-wrap items-start gap-6">
          <Contents label="Right to left" entries={nested} ordered />
          <Contents
            label="Right to left, diagonal"
            entries={nested}
            $guide="diagonal"
          />
        </div>
        <Contents label="Uneven targets" entries={uneven} />
      </div>
      <GrowingSteps />
      <div className="flex flex-wrap items-start gap-6">
        <MissingTargets />
        <ShownLater />
      </div>
    </div>
  );
}
