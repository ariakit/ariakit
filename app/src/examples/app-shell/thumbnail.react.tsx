import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";

export default function Thumbnail() {
  return (
    <div
      className="flex justify-center pointer-events-none text-xs"
      aria-hidden
    >
      <Frame
        $layer
        $rounded="xl"
        $border
        $p="none"
        className="mt-5 grid w-80 grid-cols-[5rem_1fr_4rem] grid-rows-[2.25rem_7.5rem] overflow-clip"
      >
        <Frame
          $layer
          $darken={0.5}
          $p="none"
          className="col-span-full flex items-center justify-between px-2"
        >
          <SkeletonLine $weight="bold" className="w-10" />
          <SkeletonLine className="w-9" />
        </Frame>
        <Frame $layer $darken={0.25} $p={1.5} className="flex flex-col gap-1.5">
          <SkeletonLine $weight="medium" className="w-10" />
          <SkeletonLine $weight="light" className="w-12" />
          <SkeletonLine $weight="light" className="w-7" />
        </Frame>
        <div className="flex flex-col gap-1.5 p-2">
          <SkeletonLine $weight="bold" className="w-24 text-lg" />
          <SkeletonLine $weight="light" className="w-24" />
          <SkeletonLine $weight="light" className="w-20" />
        </div>
        <Frame $layer $darken={0.25} $p={1.5} className="flex flex-col gap-1.5">
          <SkeletonLine $weight="light" className="w-9" />
          <SkeletonLine $weight="light" className="w-7" />
        </Frame>
      </Frame>
    </div>
  );
}
