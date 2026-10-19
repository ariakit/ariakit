import type { FrameProps } from "@ariakit/ui/components/frame.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonBox,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { Hexagon, PanelLeft } from "lucide-react";

// Sidebar links with placeholder widths as fractions of the link. A strong line
// marks the current page.
const links = [
  { id: "installation", width: "w-4/5", current: true },
  { id: "structure", width: "w-4/5" },
  { id: "configuration", width: "w-3/4" },
  { id: "routing", width: "w-1/2" },
  { id: "data", width: "w-2/3" },
  { id: "deployment", width: "w-3/5" },
];

// A square frame that keeps straight corners inside the rounded window.
function Region(props: FrameProps) {
  return <Frame $rounded="none" $forceRounded $p="none" {...props} />;
}

export default function Thumbnail() {
  return (
    <Frame
      $layer
      $lighten
      $rounded="xl"
      $border
      $p="none"
      className="mt-4 grid w-88 grid-cols-[5rem_1fr] grid-rows-[auto_16rem] overflow-clip text-xs shadow-lg"
    >
      <Region
        $p={2.5}
        className="col-span-full flex items-center gap-2 border-b"
      >
        <PanelLeft className="ak-ink-70 size-3.5" />
        <Hexagon className="size-3.5" />
        <span className="font-semibold">Acme Docs</span>
        <span className="ms-auto font-medium">Sign in</span>
      </Region>
      <Region $p={3} className="grid content-start gap-1 border-e">
        {links.map((link) => (
          <SkeletonLine
            key={link.id}
            $weight={link.current ? "bold" : "light"}
            className={link.width}
          />
        ))}
      </Region>
      <Frame $p={4} className="grid content-start gap-1">
        <span className="mb-1 text-lg font-semibold">Getting started</span>
        <SkeletonLine $weight="light" className="w-full" />
        <SkeletonLine $weight="light" className="w-3/4" />
        <SkeletonLine $weight="bold" className="mt-2 w-2/5 text-sm" />
        <SkeletonLine $weight="light" className="w-full" />
        <SkeletonLine $weight="light" className="w-11/12" />
        <SkeletonLine $weight="light" className="w-1/2" />
        <SkeletonLine $weight="bold" className="mt-2 w-1/2 text-sm" />
        <SkeletonLine $weight="light" className="w-full" />
        <SkeletonLine $weight="light" className="w-2/3" />
      </Frame>
    </Frame>
  );
}

export function SmallThumbnail() {
  return (
    <Frame
      $layer
      $lighten
      $p="none"
      className="grid grid-cols-[--spacing(20.5)_1fr] grid-rows-[auto_1fr]"
    >
      <Region
        $p={3.5}
        $edgeWeight={15}
        className="col-span-full flex items-center gap-3.5 border-b"
      >
        <Frame
          $layer="brand"
          $rounded="full"
          $forceRounded
          className="size-4.5"
        />
        <SkeletonLine
          $weight="medium"
          className="w-1/4 text-[0.9em] leading-none"
        />
      </Region>
      <Region
        $p={3.5}
        $edgeWeight={15}
        className="flex flex-col gap-3.5 border-e"
      >
        <SkeletonLine
          $weight="bold"
          className="w-full text-[0.9em] leading-none"
        />
        <SkeletonLine className="w-4/5 text-[0.9em] leading-none" />
        <SkeletonLine className="w-3/5 text-[0.9em] leading-none" />
      </Region>
      <Region $p={4.5} className="flex flex-col gap-4.5" $darken={0.5}>
        <SkeletonLine
          $weight="bold"
          className="w-3/4 text-[1.25em] leading-none"
        />
        <div className="grid flex-1 grid-cols-2 gap-3.5">
          <SkeletonBox $weight="light" $rounded="sm" $forceRounded />
          <SkeletonBox $weight="light" $rounded="sm" $forceRounded />
        </div>
      </Region>
    </Frame>
  );
}
