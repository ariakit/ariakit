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
    </>
  );
}
