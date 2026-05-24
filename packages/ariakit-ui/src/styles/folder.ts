import { cv } from "clava";
import { layer } from "./layer.ts";

export const folder = cv({
  extend: [layer],
  variants: {
    $kind: {
      folder: [
        "relative border-b-0",
        "[clip-path:inset(-4rem_-4rem_0_-4rem)]",
        "ui-selected:rounded-b-none",
        "ui-selected:[--folder-edge:var(--ak-edge)]",
        "ui-selected:[--folder-ring:var(--ak-frame-ring,0px)]",
        "ui-selected:[--folder-border:var(--ak-frame-border,0px)]",
        "ui-selected:[--folder-bordering:calc(var(--ak-frame-border,0px)+var(--ak-frame-ring,0px))]",
        "ui-selected:befter:[--folder-smoothness:min(0.2px,var(--folder-bordering))]",
        "ui-selected:befter:[--folder-inner:var(--ak-frame-radius,0px)]",
        "ui-selected:befter:[--folder-inner-border:calc(var(--folder-inner)-var(--folder-smoothness))]",
        "ui-selected:befter:[--folder-inner-bg:calc(var(--folder-inner)+var(--folder-smoothness))]",
        "ui-selected:befter:[--folder-outer:calc(var(--folder-inner)-var(--folder-bordering))]",
        "ui-selected:befter:[--folder-outer-border:calc(var(--folder-outer)+var(--folder-smoothness))]",
        "ui-selected:befter:[--folder-outer-bg:calc(var(--folder-outer)-var(--folder-smoothness))]",
        "ui-selected:befter:[--folder-transparent:transparent_var(--folder-outer-bg)]",
        "ui-selected:befter:[--folder-border:var(--folder-edge)_var(--folder-outer-border),var(--folder-edge)_var(--folder-inner-border)]",
        "ui-selected:befter:[--folder-bg:var(--ak-layer)_var(--folder-inner-bg)]",
        "ui-selected:befter:[--folder-gradient:var(--folder-transparent),var(--folder-border),var(--folder-bg)]",
        "ui-selected:befter:[--folder-backdrop-ring:calc(var(--folder-outer-border)+var(--folder-ring))]",
        "ui-selected:befter:[--folder-backdrop:transparent_var(--folder-outer-border),var(--ak-layer-parent)_var(--folder-outer-border),var(--ak-layer-parent)_var(--folder-backdrop-ring),var(--ak-layer)_var(--folder-backdrop-ring)]",
        "ui-selected:befter:pointer-events-none befter:absolute befter:bottom-0 befter:border-none befter:bg-no-repeat",
        "ui-selected:befter:size-(--ak-frame-radius)",
        "ui-selected:befter:transition-[--ak-frame-radius]",
        "ui-selected:befter:duration-(--duration-tabs)",
        "ui-selected:befter:ease-tabs",
        // before
        "ui-selected:before:inset-e-full",
        "ui-selected:before:bg-[radial-gradient(circle_at_0_0,var(--folder-gradient)),radial-gradient(circle_at_0_0,var(--folder-backdrop))]",
        // after
        "ui-selected:after:inset-s-full",
        "ui-selected:after:bg-[radial-gradient(circle_at_100%_0,var(--folder-gradient)),radial-gradient(circle_at_100%_0,var(--folder-backdrop))]",
      ],
    },
  },
});
