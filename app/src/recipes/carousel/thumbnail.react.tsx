import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonBox,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  carousel,
  carouselButton,
  carouselButtonArea,
  carouselSlide,
  carouselTab,
  carouselTabList,
  carouselViewport,
} from "@ariakit/ui/styles/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

const dots = ["one", "two", "three", "four", "five"];

// Two slides share the row, less half the gap each.
const halfSlide = "basis-[calc(50%-var(--carousel-gap)/2)]";

// A carousel of slides on its second page, between its two buttons.
export default function Thumbnail() {
  return (
    <div {...carousel.jsx({ className: "w-[22em] max-w-full" })}>
      <div {...carouselViewport.jsx()}>
        <div {...carouselSlide.jsx({ className: halfSlide })}>
          <SkeletonBox $rounded="xl" className="h-24 w-full" />
        </div>
        <div {...carouselSlide.jsx({ className: halfSlide })}>
          <SkeletonBox $weight="medium" $rounded="xl" className="h-24 w-full" />
        </div>
      </div>
      <span {...carouselButtonArea.jsx({ $side: "start" })}>
        <span {...carouselButton.jsx({ $side: "start" })}>
          <ChevronLeft />
        </span>
      </span>
      <span {...carouselButtonArea.jsx({ $side: "end" })}>
        <span {...carouselButton.jsx({ $side: "end" })}>
          <ChevronRight />
        </span>
      </span>
      <div {...carouselTabList.jsx()}>
        {dots.map((dot) => (
          <span
            key={dot}
            {...carouselTab.jsx()}
            aria-selected={dot === "two"}
          />
        ))}
      </div>
    </div>
  );
}

export function SmallThumbnail() {
  return (
    <Frame $lighten $p={5.5} className="flex flex-col gap-4">
      <div className="flex flex-1 items-center gap-3">
        <ChevronLeft className="size-8 shrink-0 stroke-3 opacity-60" />
        <SkeletonBox $rounded="sm" $forceRounded className="h-full flex-1" />
        <ChevronRight className="size-8 shrink-0 stroke-3 opacity-60" />
      </div>
      <div className="flex justify-center gap-2">
        <SkeletonLine $weight="bold" className="w-8 leading-none" />
        <SkeletonLine $weight="light" className="w-4 leading-none" />
        <SkeletonLine $weight="light" className="w-4 leading-none" />
      </div>
    </Frame>
  );
}
