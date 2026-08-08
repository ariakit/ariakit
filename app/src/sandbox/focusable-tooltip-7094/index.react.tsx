import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div>
      <p>Click here, then press Option+Tab to focus the button.</p>
      <Ariakit.TooltipProvider>
        <Ariakit.TooltipAnchor render={<Ariakit.Button />}>
          Bookmark
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>Add to bookmarks</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>
    </div>
  );
}
