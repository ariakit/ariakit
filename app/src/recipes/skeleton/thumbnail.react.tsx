import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonBox,
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";

// A post card that is still loading.
export default function Thumbnail() {
  return (
    <Frame
      $layer
      $lighten
      $rounded="xl"
      $border
      $p={4}
      className="grid w-[20em] max-w-full content-start gap-3 shadow-sm"
    >
      <div className="flex items-center gap-2.5">
        <SkeletonCircle $weight="medium" className="size-9 shrink-0" />
        <div className="grid flex-1">
          <SkeletonLine $weight="bold" className="w-2/5" />
          <SkeletonLine $weight="light" className="w-1/4" />
        </div>
        <SkeletonBox $weight="medium" $rounded="full" className="h-7 w-16" />
      </div>
      <div className="grid">
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-1/3" />
      </div>
      <SkeletonBox $rounded="lg" className="h-12 w-full" />
    </Frame>
  );
}

export function SmallThumbnail() {
  return (
    <Frame $layer $lighten $p={5.5} className="flex flex-col gap-4.5">
      <div className="flex items-center gap-4.5">
        <SkeletonCircle $weight="medium" className="size-11.5 shrink-0" />
        <div className="grid flex-1 gap-1">
          <SkeletonLine
            $weight="bold"
            className="w-3/5 text-[1.25em] leading-none"
          />
          <SkeletonLine
            $weight="light"
            className="w-1/3 text-[1.25em] leading-none"
          />
        </div>
      </div>
      <SkeletonBox $rounded="sm" $forceRounded className="w-full flex-1" />
    </Frame>
  );
}
