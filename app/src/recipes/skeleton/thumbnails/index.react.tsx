import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonBox,
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import type { ReactNode } from "react";

// Parts outside a Skeleton root are static placeholders. They never animate, so
// they suit decorative previews such as gallery thumbnails.
export default function Example() {
  return (
    <ul className="grid w-2xl max-w-full grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-3">
      <Thumbnail title="Inbox">
        <div className="grid gap-2.5">
          {["w-3/4", "w-1/2", "w-2/3"].map((width) => (
            <div key={width} className="flex items-center gap-2">
              <SkeletonCircle className="size-5 shrink-0" />
              <div className="grid flex-1">
                <SkeletonLine $weight="medium" className={width} />
                <SkeletonLine $weight="light" className="w-full" />
              </div>
            </div>
          ))}
        </div>
      </Thumbnail>
      <Thumbnail title="Dashboard">
        <div className="grid gap-2">
          <SkeletonLine $weight="bold" className="w-1/2" />
          <div className="grid grid-cols-3 gap-1.5">
            <SkeletonBox $weight="light" className="h-7" />
            <SkeletonBox $weight="light" className="h-7" />
            <SkeletonBox $weight="light" className="h-7" />
          </div>
          <div className="flex h-14 items-end gap-1">
            {["h-1/3", "h-2/3", "h-1/2", "h-full", "h-3/4", "h-2/5"].map(
              (height) => (
                <SkeletonBox
                  key={height}
                  $weight="medium"
                  $rounded="xs"
                  className={`flex-1 ${height}`}
                />
              ),
            )}
          </div>
        </div>
      </Thumbnail>
      <Thumbnail title="Profile">
        <div className="grid justify-items-center gap-1">
          <SkeletonCircle $weight="medium" className="mb-1 size-10" />
          <SkeletonLine $weight="bold" className="w-1/2" />
          <SkeletonLine $weight="light" className="w-1/3" />
          <Frame
            $layer="brand"
            $rounded="full"
            $p="none"
            className="mt-2 h-4 w-14 opacity-80"
          />
        </div>
      </Thumbnail>
    </ul>
  );
}

interface ThumbnailProps {
  title: string;
  children: ReactNode;
}

function Thumbnail({ title, children }: ThumbnailProps) {
  return (
    <li className="grid grid-rows-[1fr_auto] gap-2">
      <Frame
        $layer
        $darken={0.25}
        $rounded="xl"
        $border
        $p={3}
        aria-hidden
        className="grid content-center text-[0.625rem]"
      >
        <Frame
          $layer
          $lighten
          $rounded="lg"
          $border
          $p={3}
          className="shadow-xs"
        >
          {children}
        </Frame>
      </Frame>
      <span className="text-center text-sm ak-ink-70">{title}</span>
    </li>
  );
}
