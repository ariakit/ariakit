import { cva } from "cva";

export const kbd = cva({
  base: [
    "ak-layer-pop-1.5",
    "ak-edge-5/100 ak-dark:ak-edge/16",
    "font-sans p-[0.1em_0.25em]",
    "[font-size-adjust:0.49]",
    "rounded-[0.27em_0.27em_0.34em_0.34em] ak-dark:rounded-b-[0.4em]",
    "border-[max(1px,0.067em)_0_max(1px,0.15em)] ak-dark:border-[0_0_max(1px,0.2em)]",
    "border-[white_transparent_var(--ak-border)] ak-dark:border-b-[oklch(from_var(--ak-layer)_calc(l-0.08)_c_h)]",
    "bg-linear-to-b from-transparent to-[oklch(from_var(--ak-layer)_calc(l+0.05)_c_h)]",
    "[box-shadow:0_0_0_max(1px,0.034em)_var(--ak-border)] ak-dark:[box-shadow:0_min(-1px,-0.06em)_var(--ak-border),0_0_0_max(1px,0.06em)_var(--ak-border)]",
  ],
});
