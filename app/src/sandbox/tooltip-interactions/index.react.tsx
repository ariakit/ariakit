import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <>
      <Ariakit.TooltipProvider hideTimeout={20} timeout={20}>
        <Ariakit.TooltipAnchor render={<a href="#tooltip" />}>
          Tooltip anchor
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>Tooltip content</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>
      <button>After tooltip</button>
      <Ariakit.TooltipProvider hideTimeout={1000} timeout={20}>
        <Ariakit.TooltipAnchor render={<button />}>
          Delayed hide anchor
        </Ariakit.TooltipAnchor>
        {/* The exit transition keeps the closed tooltip mounted while the
            pointer moves, so a hide can be pending when focus reopens it. */}
        <Ariakit.Tooltip style={{ transition: "opacity 2s" }}>
          Delayed hide content
        </Ariakit.Tooltip>
      </Ariakit.TooltipProvider>
      <Ariakit.TooltipProvider hideTimeout={20} timeout={20}>
        <label htmlFor="tooltip-username">Username</label>
        <Ariakit.TooltipAnchor render={<input id="tooltip-username" />} />
        <Ariakit.Tooltip>Your public name</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>
    </>
  );
}
