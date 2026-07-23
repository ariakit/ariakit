import { cv } from "clava";

export const aurora = cv({
  variants: {
    /**
     * Renders an animated gradient ring around the element in the given
     * color. The ring is a masked ::after overlay that hugs the frame
     * border, so it works on top of any layer or bevel, and it slides to
     * the opposite corner while hovered. Use `$auroraTo` to blend a second
     * color into the gradient. The effect owns the element’s ::after, so
     * don’t combine it with other ::after consumers like folder tabs or
     * glider groups.
     */
    $aurora(value?: string) {
      if (!value) return;
      return {
        class: [
          "relative",
          // Track the full visible edge (border or ring, whichever mode the
          // frame chose) with a 1px floor. The floor must be a max():
          // --ak-frame-border is a registered property with an initial
          // value, so a plain var() fallback never fires — which is exactly
          // how the legacy 1px fallback ended up dead and the legacy ring
          // never rendered on borderless buttons.
          "[--aurora-border:max(calc(var(--ak-frame-border,0px)+var(--ak-frame-ring,0px)),1px)]",
          "after:content-[''] after:absolute after:pointer-events-none",
          "after:rounded-[inherit] after:-inset-(--aurora-border)",
          "after:p-(--aurora-border)",
          "after:transition-[background-position] after:duration-750",
          // Two stacked masks subtracted from each other keep only the
          // padding area of the ::after, turning the gradient into a ring.
          "after:[mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#fff_0_0)]",
          "after:bg-[linear-gradient(to_bottom_right,var(--aurora-color),transparent,transparent,var(--aurora-color-to,transparent),transparent,transparent,var(--aurora-color))]",
          // Double-size background so the hover slide has somewhere to go.
          "after:bg-size-[200%_200%]",
          "ui-hover:after:bg-position-[100%_100%]",
        ],
        style: { "--aurora-color": value },
      };
    },
    /**
     * Sets the second color of the `$aurora` gradient. It appears midway
     * through the ring and takes over as the gradient slides on hover.
     */
    $auroraTo(value?: string) {
      if (!value) return;
      return {
        style: { "--aurora-color-to": value },
      };
    },
  },
});
