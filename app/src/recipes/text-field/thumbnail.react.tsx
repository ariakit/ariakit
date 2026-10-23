import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import { input, inputSlot } from "@ariakit/ui/styles/input";
import { Globe } from "lucide-react";

export default function Thumbnail() {
  return (
    <div className="grid w-72 gap-6">
      <div className="grid gap-1.5">
        <SkeletonLine $weight="bold" className="w-1/3 text-sm" />
        <div {...input.jsx({ $edge: "danger" })}>
          <SkeletonLine $weight="medium" className="w-1/2" />
        </div>
        {/*
         * The push would lighten the error line away from the border color.
         */}
        <SkeletonLine
          $layer="danger"
          $lightnessPush={false}
          className="w-2/3 text-sm"
        />
      </div>
      <div {...input.jsx()}>
        <span {...inputSlot.jsx({ $ink: 60 })}>
          <Globe />
        </span>
        <SkeletonLine $weight="light" className="w-2/5" />
      </div>
    </div>
  );
}

export function SmallThumbnail() {
  return (
    <Frame
      $layer
      $lighten
      $p={5.5}
      className="flex flex-col justify-center gap-3"
    >
      <SkeletonLine
        $weight="bold"
        className="w-2/5 text-[1.1em] leading-none"
      />
      <div {...input.jsx({ $forceRounded: true, className: "py-3.5" })}>
        <SkeletonLine
          $weight="medium"
          className="w-1/2 text-[1.25em] leading-none"
        />
      </div>
      <SkeletonLine
        $layer="danger"
        $lightnessPush={false}
        className="w-3/5 text-[0.9em] leading-none"
      />
    </Frame>
  );
}
