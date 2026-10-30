import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  toc,
  tocItem,
  tocLabel,
  tocLink,
  tocLinkGuide,
  tocLinkThumb,
  tocList,
} from "@ariakit/ui/styles/toc";
import type { CSSProperties } from "react";

interface RowData {
  id: string;
  width: string;
  current?: boolean;
  // Whether the section of the row is on the screen, under the thumb.
  visible?: boolean;
}

const smallRows: RowData[] = [
  { id: "overview", width: "w-3/5" },
  { id: "install", width: "w-2/3" },
  { id: "usage", width: "w-1/2", current: true, visible: true },
  { id: "styling", width: "w-1/2" },
];

// A row of the small table of contents. The guide runs along its start, and an
// inverted bar on the guide stands for the thumb.
function Row({ width, current, visible }: RowData) {
  return (
    <div className="relative py-0.5 ps-3">
      <span className="absolute inset-y-0 inset-s-0.5 w-px bg-(--ak-edge)" />
      {visible && (
        <Frame
          render={<span />}
          $layer
          $invert
          $rounded="full"
          $p="none"
          className="absolute inset-y-0 inset-s-0 w-0.5"
        />
      )}
      <Frame
        $layer={current ? true : "transparent"}
        $lighten={current ? 1 : undefined}
        $rounded="md"
        $p={1.5}
      >
        <SkeletonLine
          $weight={current ? "bold" : "light"}
          $rounded="xs"
          $forceRounded
          className={width}
        />
      </Frame>
    </div>
  );
}

interface SectionData {
  id: string;
  label: string;
  current?: boolean;
  // Whether the section is on the screen, under the thumb.
  visible?: boolean;
  sections?: SectionData[];
}

const sections: SectionData[] = [
  { id: "overview", label: "Overview" },
  { id: "installation", label: "Installation" },
  {
    id: "usage",
    label: "Usage",
    current: true,
    visible: true,
    sections: [
      { id: "basic", label: "Basic example", visible: true },
      { id: "controlled", label: "Controlled state" },
    ],
  },
  { id: "styling", label: "Styling" },
];

// Static markup has no scroll spy to measure the thumb range, so each thumb
// piece of a visible section gets a range that covers the whole piece. Other
// pieces keep the empty default range.
const fullThumbRange = {
  "--toc-thumb-start": "0px",
  "--toc-thumb-end": "999px",
} as CSSProperties;

function Section({ section }: { section: SectionData }) {
  return (
    <li {...tocItem.jsx()}>
      {/* The thumbnail sits inside the card link, and a nested link would
          end that link early. */}
      <span
        {...tocLink.jsx()}
        aria-current={section.current ? "location" : undefined}
      >
        {section.label}
        <span aria-hidden {...tocLinkGuide.jsx()} />
        <span
          aria-hidden
          {...tocLinkThumb.jsx()}
          style={section.visible ? fullThumbRange : undefined}
        />
      </span>
      {section.sections && (
        <ul {...tocList.jsx()}>
          {section.sections.map((child) => (
            <Section key={child.id} section={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Thumbnail() {
  return (
    // The article shrinks, so the table of contents stays in narrow cards.
    <div className="flex max-w-full items-start gap-8">
      <div className="grid w-80 min-w-0 gap-2">
        <span className="ak-ink-70">Guides</span>
        <span className="text-xl font-semibold">Usage</span>
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-2/3" />
        <span className="mt-2 text-lg font-semibold">Basic example</span>
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-1/2" />
      </div>
      <div {...toc.jsx({ $size: "auto", className: "w-52 shrink-0" })}>
        <div {...tocLabel.jsx()}>On this page</div>
        <ul {...tocList.jsx()}>
          {sections.map((section) => (
            <Section key={section.id} section={section} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SmallThumbnail() {
  return (
    <Frame $layer $lighten $p={3} className="grid content-start text-[0.9em]">
      {smallRows.map((row) => (
        <Row key={row.id} {...row} />
      ))}
    </Frame>
  );
}
