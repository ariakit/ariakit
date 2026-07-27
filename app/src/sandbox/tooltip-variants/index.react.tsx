import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <>
      <section aria-label="Instant tooltip">
        <Ariakit.TooltipProvider timeout={0}>
          <Ariakit.TooltipAnchor render={<Ariakit.Button />}>
            Instant anchor
          </Ariakit.TooltipAnchor>
          <Ariakit.Tooltip>Instant tooltip</Ariakit.Tooltip>
        </Ariakit.TooltipProvider>
      </section>

      <section aria-label="Tooltip label">
        <Ariakit.TooltipProvider timeout={20}>
          <Ariakit.TooltipAnchor render={<Ariakit.Button />}>
            Bold
          </Ariakit.TooltipAnchor>
          <Ariakit.Tooltip>Bold label</Ariakit.Tooltip>
        </Ariakit.TooltipProvider>
      </section>

      <section aria-label="Animated tooltip">
        <Ariakit.TooltipProvider animated={100} timeout={20}>
          <Ariakit.TooltipAnchor render={<a href="#animated-tooltip" />}>
            Animated anchor
          </Ariakit.TooltipAnchor>
          <Ariakit.Tooltip
            unmountOnHide
            className="opacity-0 transition-opacity duration-100 data-enter:opacity-100"
          >
            Animated tooltip
          </Ariakit.Tooltip>
        </Ariakit.TooltipProvider>
      </section>
    </>
  );
}
