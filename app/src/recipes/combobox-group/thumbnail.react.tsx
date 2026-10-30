import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  comboboxField,
  comboboxGroup,
  comboboxGroupLabel,
  comboboxInput,
  comboboxItem,
  comboboxItemContent,
  comboboxItemDescription,
  comboboxItemLabel,
  comboboxItemSlot,
  comboboxLabel,
  comboboxPopover,
} from "@ariakit/ui/styles/combobox";
import type { LucideIcon } from "lucide-react";
import { FileText, Hash } from "lucide-react";

interface ResultData {
  id: string;
  // The part of the label that matches the typed text, shown in bold.
  match: string;
  rest: string;
  description: string;
  initials?: string;
  icon?: LucideIcon;
  highlighted?: boolean;
}

interface GroupData {
  id: string;
  label: string;
  results: ResultData[];
  // The icon of a placeholder row after the results, if any.
  placeholder?: LucideIcon;
}

const groups: GroupData[] = [
  {
    id: "people",
    label: "People",
    results: [
      {
        id: "jane",
        match: "Ja",
        rest: "ne Smith",
        description: "jane@acme.dev",
        initials: "JS",
        highlighted: true,
      },
      {
        id: "james",
        match: "Ja",
        rest: "mes Anderson",
        description: "james@acme.dev",
        initials: "JA",
      },
    ],
  },
  {
    id: "files",
    label: "Files",
    results: [
      {
        id: "january",
        match: "Ja",
        rest: "nuary report.pdf",
        description: "Finance · 2.4 MB",
        icon: FileText,
      },
    ],
    placeholder: FileText,
  },
  {
    id: "channels",
    label: "Channels",
    results: [
      {
        id: "javascript",
        match: "ja",
        rest: "vascript",
        description: "1,204 members",
        icon: Hash,
      },
    ],
    placeholder: Hash,
  },
];

function Result({ result }: { result: ResultData }) {
  return (
    <div {...comboboxItem.jsx({ $highlighted: result.highlighted })}>
      {result.icon ? (
        <span {...comboboxItemSlot.jsx({ $rowSpan: 2 })}>
          <result.icon />
        </span>
      ) : (
        <span
          {...comboboxItemSlot.jsx({
            $kind: "avatar",
            $size: "md",
            $rowSpan: 2,
            $layer: "brand",
            $contrast: true,
          })}
        >
          {result.initials}
        </span>
      )}
      <div {...comboboxItemContent.jsx()}>
        <div {...comboboxItemLabel.jsx()}>
          <b>{result.match}</b>
          {result.rest}
        </div>
        <div {...comboboxItemDescription.jsx()}>{result.description}</div>
      </div>
    </div>
  );
}

function Placeholder({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div {...comboboxItem.jsx()}>
      <span {...comboboxItemSlot.jsx({ $rowSpan: 2 })}>
        <Icon />
      </span>
      <div {...comboboxItemContent.jsx()}>
        <SkeletonLine className="w-2/5" />
        <SkeletonLine $weight="light" className="w-1/4" />
      </div>
    </div>
  );
}

export default function Thumbnail() {
  return (
    <div className="grid w-72 max-w-full gap-2">
      <div {...comboboxField.jsx()}>
        <span {...comboboxLabel.jsx()}>Search</span>
        <div {...comboboxInput.jsx()}>Ja</div>
      </div>
      <div
        data-open
        {...comboboxPopover.jsx({ className: "max-w-none transition-none" })}
      >
        {groups.map((group) => (
          <div key={group.id} {...comboboxGroup.jsx()}>
            <div {...comboboxGroupLabel.jsx()}>{group.label}</div>
            {group.results.map((result) => (
              <Result key={result.id} result={result} />
            ))}
            {group.placeholder && <Placeholder icon={group.placeholder} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SmallThumbnail() {
  return (
    <Frame $layer $lighten className="flex flex-col">
      <Frame
        $cover
        $darken
        $p={3}
        $edgeWeight={15}
        className="flex shrink-0 items-center border-b"
      >
        <SkeletonLine
          $weight="medium"
          className="w-1/2 text-[1.25em] leading-none"
        />
      </Frame>
      <Frame
        $rounded="none"
        $forceRounded
        $p={2}
        className="flex flex-1 flex-col justify-center gap-0.5"
      >
        <SkeletonLine
          $weight="light"
          className="mx-2 w-1/4 text-[0.9em] leading-none"
        />
        <Frame
          $layer
          $lightnessPush
          $rounded="md"
          $forceRounded
          $p={2}
          className="flex items-center gap-3.5"
        >
          <Frame
            $layer="brand"
            $rounded="full"
            $forceRounded
            className="size-7 shrink-0"
          />
          <SkeletonLine
            $weight="bold"
            className="w-3/5 text-[1.25em] leading-none"
          />
        </Frame>
        <Frame $p={2} className="flex items-center gap-3.5">
          <SkeletonCircle className="size-7 shrink-0" />
          <SkeletonLine className="w-1/2 text-[1.25em] leading-none" />
        </Frame>
      </Frame>
    </Frame>
  );
}
