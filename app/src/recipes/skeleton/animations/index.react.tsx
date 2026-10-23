import { CheckboxField } from "@ariakit/ui/components/checkbox.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import type { SkeletonProps } from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  Skeleton,
  SkeletonBox,
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { Music } from "lucide-react";
import { useState } from "react";

const animations = [
  { label: "Shimmer", value: "shimmer" },
  { label: "Pulse", value: "pulse" },
  { label: "None", value: false },
] satisfies Array<{ label: string; value: SkeletonProps["$animate"] }>;

export default function Example() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="grid w-2xl max-w-full gap-6">
      <CheckboxField
        checked={loading}
        onChange={(event) => setLoading(event.target.checked)}
        className="justify-self-center"
      >
        Loading
      </CheckboxField>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4">
        {animations.map((animation) => (
          <figure key={animation.label} className="grid gap-2">
            <Skeleton
              loading={loading}
              $animate={animation.value}
              render={<Frame $layer $lighten $rounded="xl" $border $p={2} />}
              className="grid gap-3 shadow-xs"
            >
              <SkeletonBox $rounded="lg" className="aspect-square w-full">
                <Frame
                  $layer="brand"
                  $rounded="lg"
                  $p="none"
                  aria-hidden
                  className="grid aspect-square w-full place-items-center"
                >
                  <Music className="size-10 opacity-80" strokeWidth={1.5} />
                </Frame>
              </SkeletonBox>
              <div className="flex items-center gap-2 px-1 pb-1">
                <SkeletonCircle className="size-8 shrink-0">
                  <Frame
                    $layer="secondary"
                    $rounded="full"
                    $forceRounded
                    $p="none"
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center"
                  >
                    <span className="text-xs font-semibold">LN</span>
                  </Frame>
                </SkeletonCircle>
                <div className="grid min-w-0 flex-1 text-sm">
                  <SkeletonLine $weight="medium" className="w-4/5">
                    <span className="truncate font-medium">
                      Late Night Drive
                    </span>
                  </SkeletonLine>
                  <SkeletonLine $weight="light" className="w-1/2">
                    <span className="truncate ak-ink-70">Luna Novak</span>
                  </SkeletonLine>
                </div>
              </div>
            </Skeleton>
            <figcaption className="text-center text-sm ak-ink-70">
              {animation.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
