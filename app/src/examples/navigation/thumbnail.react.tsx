import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

interface RowData {
  id: string;
  width: string;
  current?: boolean;
  badge?: boolean;
}

// Navigation rows with placeholder label widths as fractions of the row. A
// stronger line and a bar beside it mark the current row.
const rows: RowData[] = [
  { id: "home", width: "w-3/5" },
  { id: "inbox", width: "w-2/5", badge: true },
  { id: "reports", width: "w-2/3", current: true },
];

const sectionRows: RowData[] = [
  { id: "overview", width: "w-3/4" },
  { id: "members", width: "w-1/2" },
];

const smallRows: RowData[] = [
  { id: "home", width: "w-3/5" },
  { id: "inbox", width: "w-1/2", current: true },
  { id: "reports", width: "w-2/5", badge: true },
  { id: "team", width: "w-1/2" },
];

// A brand pill that stands for a count badge at the end of a row.
function Badge({ className }: { className?: string }) {
  return (
    <Frame
      $layer="brand"
      $rounded="full"
      $forceRounded
      $p="none"
      className={clsx("ms-auto shrink-0", className)}
    />
  );
}

function Row({ width, current, badge }: RowData) {
  return (
    <div className="relative flex items-center gap-2 px-2 py-1.5">
      {current && (
        <Frame
          render={<span />}
          $layer
          $invert
          $rounded="full"
          $p="none"
          className="absolute -inset-s-2 inset-y-1 w-0.5"
        />
      )}
      <SkeletonCircle
        $weight={current ? "bold" : "light"}
        className="size-3 shrink-0"
      />
      <SkeletonLine
        $weight={current ? "bold" : "light"}
        $rounded="xs"
        $forceRounded
        className={width}
      />
      {badge && <Badge className="h-2.5 w-4" />}
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
      $p={2}
      className="mt-4 grid w-96 grid-cols-2 gap-2 text-xs shadow-lg"
    >
      <div className="grid content-start gap-0.5 py-1">
        {rows.map((row) => (
          <Row key={row.id} {...row} />
        ))}
        <div className="flex items-center gap-2 px-2 pt-2.5 pb-1">
          <SkeletonLine
            $weight="medium"
            $rounded="xs"
            $forceRounded
            className="w-1/2"
          />
          <ChevronDown className="ak-ink-60 ms-auto size-3" />
        </div>
        {/* The guide takes the card's edge color, like the card border. */}
        <div className="ms-3.5 grid gap-0.5 border-s border-(--ak-edge) ps-1">
          {sectionRows.map((row) => (
            <Row key={row.id} {...row} />
          ))}
        </div>
      </div>
      <Frame $layer $darken $rounded="2xl" />
    </Frame>
  );
}

export function SmallThumbnail() {
  return (
    <Frame $layer $lighten $p="none" className="grid grid-cols-2">
      <Frame
        $rounded="none"
        $forceRounded
        $p={3}
        $edgeWeight={15}
        className="flex flex-col gap-2 border-e"
      >
        {smallRows.map((row) => (
          <div key={row.id} className="flex items-center gap-2 p-1.5">
            <SkeletonCircle
              $weight={row.current ? "bold" : "light"}
              className="size-[0.9em] shrink-0"
            />
            <SkeletonLine
              $weight={row.current ? "bold" : "light"}
              className={clsx(row.width, "text-[0.9em] leading-none")}
            />
            {row.badge && <Badge className="h-[0.8em] w-[1.4em]" />}
          </div>
        ))}
      </Frame>
      <Frame $layer $darken={0.5} $rounded="none" $forceRounded $p="none" />
    </Frame>
  );
}
