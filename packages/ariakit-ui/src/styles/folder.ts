import { cv } from "clava";
import { background } from "./background.ts";
import { border } from "./border.ts";

export const folderVars = {
  ease: "--folder-ease",
  duration: "--folder-duration",
} as const;

export const folder = cv({
  extend: [background, border],
  variants: {
    $kind: {
      folder: [
        "not-supports-corner-shape:befter:hidden",
        "[clip-path:inset(-4rem_-4rem_0_-4rem)]",
        "[--folder-border:var(--ak-frame-border,0px)]",
        "[--folder-ring:var(--ak-frame-ring,0px)]",
        "[--folder-edge:calc(var(--folder-border)+var(--folder-ring))]",
        "relative rounded-b-none border-b-0",
        "befter:bg-inherit befter:absolute befter:box-content befter:[corner-shape:scoop]",
        "befter:-bottom-[calc(var(--folder-edge))] befter:h-(--ak-frame-radius) befter:w-[calc(var(--ak-frame-radius)+var(--folder-edge))]",
        "befter:outline-(length:--folder-ring) befter:outline-(--ak-layer-border) befter:-outline-offset-(--folder-ring)",
        "befter:border-(length:--folder-edge) befter:[border-style:inherit]",
        "befter:transition-[--ak-frame-radius] befter:duration-(--folder-duration,inherit) befter:ease-(--folder-ease,inherit)",
        // before
        "before:-start-[calc(var(--ak-frame-radius)+var(--folder-edge))]",
        "before:rounded-ss-(--ak-frame-radius)",
        "before:[clip-path:inset(var(--folder-edge)_calc(var(--folder-edge)*1.2)_var(--folder-edge)_0)]",
        // after
        "after:-end-[calc(var(--ak-frame-radius)+var(--folder-edge))]",
        "after:rounded-se-(--ak-frame-radius)",
        "after:[clip-path:inset(var(--folder-edge)_0_var(--folder-edge)_calc(var(--folder-edge)*1.2))]",
      ],
    },
  },
  computed: ({ variants, addClass }) => {
    if (variants.$kind !== "folder") return;
    // To mimic the ring effect, which is applied to the parent layer rather
    // than the current layer, we need to use `outline` instead of `border`. We
    // apply the parent layer’s background to the border, and place the outline
    // on top of it. This creates the same effect as if the ring were drawn
    // directly on top of the parent layer.
    addClass(
      variants.$borderType === "ring"
        ? "befter:border-(--ak-layer-parent)"
        : variants.$borderType === "bordering"
          ? "befter:border-(--ak-layer-border) ak-light:befter:border-(--ak-layer-parent)"
          : "befter:border-(--ak-layer-border)",
    );
  },
});
