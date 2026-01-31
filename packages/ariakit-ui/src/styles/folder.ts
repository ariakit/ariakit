import { cv } from "clava";
import { background } from "./background.ts";
import { border } from "./border.ts";

export const folder = cv({
  extend: [background, border],
  variants: {
    $kind: {
      folder: [
        "relative [--folder-border:var(--ak-frame-border)] rounded-b-none border-b-0",
        "not-supports-corner-shape:befter:hidden befter:bg-inherit",
        "befter:absolute befter:box-content befter:bottom-0 befter:size-(--ak-frame-radius)",
        "befter:border-(--ak-layer-border) befter:border-(length:--folder-border) befter:[border-style:inherit] befter:border-b-0",
        "befter:[corner-shape:scoop] befter:ease-in befter:transition-[--ak-frame-radius]",
        // before
        "before:-start-[calc(var(--ak-frame-radius)+var(--folder-border))]",
        "before:rounded-ss-(--ak-frame-radius) before:border-e-0!",
        // after
        "after:-end-[calc(var(--ak-frame-radius)+var(--folder-border))]",
        "after:rounded-se-(--ak-frame-radius) after:border-s-0!",
      ],
    },
  },
});
