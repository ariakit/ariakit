import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { separator } from "@ariakit/ui/styles/separator";
import { Fragment } from "react";

// Placeholder widths for the rows between separators.
const rows = [
  { id: "profile", width: "w-2/5" },
  { id: "billing", width: "w-1/3" },
  { id: "members", width: "w-1/2" },
];

export default function Thumbnail() {
  return (
    <div className="flex justify-center text-xs">
      <Frame
        $layer
        $lighten
        $rounded="xl"
        $border
        $p={3}
        className="grid w-72 gap-2.5 shadow-xs"
      >
        <div className="flex items-center gap-2">
          <SkeletonCircle $weight="medium" className="size-6 shrink-0" />
          <SkeletonLine $weight="bold" className="w-2/5" />
        </div>
        <div {...separator.jsx({ $line: "solid", $gap: 0 })} />
        {rows.map((row, index) => (
          <div key={row.id} className="grid gap-2.5">
            {index > 0 && (
              <div {...separator.jsx({ $line: "dashed", $gap: 0 })} />
            )}
            <div className="flex items-center justify-between">
              <SkeletonLine className={row.width} />
              <SkeletonLine $weight="light" className="w-1/8" />
            </div>
          </div>
        ))}
      </Frame>
    </div>
  );
}

export function SmallThumbnail() {
  return (
    <Frame $layer $lighten $p={5.5} className="flex flex-col justify-between">
      {rows.map((row, index) => (
        <Fragment key={row.id}>
          {index > 0 && (
            <div
              {...separator.jsx({
                $line: "solid",
                $gap: 0,
                $edgeWeight: 15,
              })}
            />
          )}
          <div className="flex items-center justify-between">
            <SkeletonLine className="w-1/2 text-[1.25em] leading-none" />
            <SkeletonLine
              $weight="light"
              className="w-1/6 text-[1.25em] leading-none"
            />
          </div>
        </Fragment>
      ))}
    </Frame>
  );
}
