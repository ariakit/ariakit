import { cv } from "clava";
import { background } from "./background.ts";
import { border } from "./border.ts";

export const folder = cv({
  extend: [background, border],
  variants: {
    $kind: {
      folder: [
        "relative rounded-b-none border-b-0",
        "[clip-path:inset(-4rem_-4rem_0_-4rem)]",
        "[--folder-edge:calc(var(--ak-frame-border,0px)+var(--ak-frame-ring,0px))]",
        "befter:[--folder-smoothness:min(0.2px,var(--folder-edge))]",
        "befter:[--folder-inner:var(--ak-frame-radius,0px)]",
        "befter:[--folder-inner-border:calc(var(--folder-inner)-var(--folder-smoothness))]",
        "befter:[--folder-inner-bg:calc(var(--folder-inner)+var(--folder-smoothness))]",
        "befter:[--folder-outer:calc(var(--folder-inner)-var(--folder-edge))]",
        "befter:[--folder-outer-border:calc(var(--folder-outer)+var(--folder-smoothness))]",
        "befter:[--folder-outer-bg:calc(var(--folder-outer)-var(--folder-smoothness))]",
        "befter:[--folder-transparent:transparent_var(--folder-outer-bg)]",
        "befter:[--folder-border:var(--ak-layer-border)_var(--folder-outer-border),var(--ak-layer-border)_var(--folder-inner-border)]",
        "befter:[--folder-bg:var(--ak-layer)_var(--folder-inner-bg)]",
        "befter:[--folder-gradient:var(--folder-transparent),var(--folder-border),var(--folder-bg)]",
        "befter:[--folder-backdrop:transparent_var(--folder-outer-border),var(--folder-border-backdrop)_var(--folder-outer-border)]",
        "befter:pointer-events-none befter:absolute befter:bottom-0 befter:border-none befter:bg-no-repeat",
        "befter:size-(--ak-frame-radius)",
        "befter:transition-[--ak-frame-radius] befter:duration-(--duration-tabs) befter:ease-tabs",
        // before
        "before:end-full",
        "before:bg-[radial-gradient(circle_at_0_0,var(--folder-gradient)),radial-gradient(circle_at_0_0,var(--folder-backdrop))]",
        // after
        "after:start-full",
        "after:bg-[radial-gradient(circle_at_100%_0,var(--folder-gradient)),radial-gradient(circle_at_100%_0,var(--folder-backdrop))]",
      ],
    },
  },
  computed: ({ variants, addClass }) => {
    if (variants.$kind !== "folder") return;
    // To mimic the ring effect, which applies to the parent layer instead of
    // the current layer, we need to apply the parent layer’s background to the
    // border backdrop.
    if (variants.$borderType === "ring") {
      addClass("[--folder-border-backdrop:var(--ak-layer-parent)]");
    } else {
      addClass("[--folder-border-backdrop:var(--ak-layer)]");
      if (variants.$borderType === "bordering") {
        addClass("ak-light:[--folder-border-backdrop:var(--ak-layer-parent)]");
      }
    }
  },
});
