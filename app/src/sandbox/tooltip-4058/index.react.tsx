import * as Ariakit from "@ariakit/react";
import "./style.css";

const lines = Array.from({ length: 24 }, (_, index) => index + 1);

export default function Example() {
  return (
    <div role="region" aria-label="Bookmarks" tabIndex={0} className="panel">
      <p>Hover the button, then scroll this panel with the mouse wheel.</p>
      <Ariakit.TooltipProvider>
        <Ariakit.TooltipAnchor
          render={<button type="button" className="button" />}
        >
          Bookmark
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip className="tooltip">Add to bookmarks</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>
      {lines.map((line) => (
        <p key={line}>Scrollable content line {line}</p>
      ))}
    </div>
  );
}
