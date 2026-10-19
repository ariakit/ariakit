import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonBox,
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";

export default function Thumbnail() {
  return (
    <div
      className="flex justify-center pointer-events-none text-xs"
      aria-hidden
    >
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
