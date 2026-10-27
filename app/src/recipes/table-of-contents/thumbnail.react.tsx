import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import { clsx } from "clsx";

interface RowData {
  id: string;
  width: string;
  nested?: boolean;
  current?: boolean;
  // Whether the section of the row is on the screen, under the thumb.
  visible?: boolean;
}

const rows: RowData[] = [
  { id: "overview", width: "w-3/5" },
  { id: "install", width: "w-2/3" },
  { id: "usage", width: "w-1/2", current: true, visible: true },
  { id: "basic", width: "w-3/5", nested: true, visible: true },
  { id: "controlled", width: "w-2/3", nested: true },
  { id: "styling", width: "w-1/2" },
];

const smallRows = rows.filter((row) => !row.nested);

// A row of the table of contents. The guide runs along its start, and an
// inverted bar on the guide stands for the thumb.
function Row({ width, nested, current, visible }: RowData) {
  return (
    <div className={clsx("relative py-0.5", nested ? "ps-5" : "ps-3")}>
      <span
        className={clsx(
          "absolute inset-y-0 w-px bg-(--ak-edge)",
          nested ? "inset-s-2.5" : "inset-s-0.5",
        )}
      />
      {visible && (
        <Frame
          render={<span />}
          $layer
          $invert
          $rounded="full"
          $p="none"
          className={clsx(
            "absolute inset-y-0 w-0.5",
            nested ? "inset-s-2" : "inset-s-0",
          )}
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

export default function Thumbnail() {
  return (
    <Frame
      $layer
      $lighten
      $rounded="2xl"
      $border
      $p={4}
      className="mt-4 grid w-96 grid-cols-[minmax(0,1fr)_8rem] gap-4 text-xs shadow-lg"
    >
      <div className="grid content-start gap-2">
        <SkeletonLine $weight="bold" className="w-1/2 text-sm" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-4/5" />
        <SkeletonLine $weight="medium" className="mt-2 w-2/5" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-3/5" />
      </div>
      <div className="grid content-start">
        {rows.map((row) => (
          <Row key={row.id} {...row} />
        ))}
      </div>
    </Frame>
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
