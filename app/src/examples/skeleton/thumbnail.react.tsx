import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonBox,
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";

export default function Thumbnail() {
  return (
    <div className="flex justify-center text-xs">
      <Frame
        $layer
        $lighten
        $rounded="xl"
        $border
        $p={3}
        className="mt-5 grid w-72 gap-3 shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <SkeletonCircle $weight="medium" className="size-8 shrink-0" />
          <div className="grid flex-1">
            <SkeletonLine $weight="bold" className="w-1/2" />
            <SkeletonLine $weight="light" className="w-1/4" />
          </div>
          <SkeletonBox $weight="medium" className="h-6 w-14" />
        </div>
        <div className="grid">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-3/5" />
        </div>
        <SkeletonBox $rounded="lg" className="h-16 w-full" />
      </Frame>
    </div>
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
