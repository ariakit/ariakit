import type { FrameProps } from "@ariakit/ui/components/frame.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonBox,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { clsx } from "clsx";
import {
  ChartBar,
  Hexagon,
  Inbox,
  LayoutDashboard,
  Settings,
} from "lucide-react";

// Sidebar links with placeholder label widths as fractions of the label slot. A
// strong line marks the current page.
const links = [
  { id: "overview", icon: LayoutDashboard, width: "w-4/5", current: true },
  { id: "inbox", icon: Inbox, width: "w-3/5" },
  { id: "reports", icon: ChartBar, width: "w-3/4" },
  { id: "settings", icon: Settings, width: "w-2/3" },
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
      className="mt-4 grid w-96 grid-cols-[6.5rem_1fr] grid-rows-[auto_16rem] overflow-clip text-xs shadow-lg"
    >
      <Region
        $p={2.5}
        className="col-span-full flex items-center gap-2 border-b"
      >
        <Hexagon className="size-3.5" />
        <span className="font-semibold">Acme</span>
        <Frame
          $layer="brand"
          $rounded="full"
          $forceRounded
          className="ms-auto size-5"
        />
      </Region>
      <Region $p={2} className="grid content-start gap-0.5 border-e">
        {links.map((link) => (
          <Frame
            key={link.id}
            $layer={link.current || undefined}
            $darken={link.current ? 1 : undefined}
            $rounded="md"
            $p={1.5}
            className="flex items-center gap-2"
          >
            <link.icon
              className={clsx("size-3 shrink-0", !link.current && "ak-ink-70")}
            />
            <SkeletonLine
              $weight={link.current ? "bold" : "light"}
              className={link.width}
            />
          </Frame>
        ))}
      </Region>
      <Region $p={4} className="grid content-start gap-3">
        <span className="text-base font-semibold">Overview</span>
        <div className="grid grid-cols-2 gap-2">
          <SkeletonBox $rounded="lg" className="h-16" />
          <SkeletonBox $rounded="lg" className="h-16" />
        </div>
        <SkeletonBox $rounded="lg" className="h-28" />
      </Region>
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
