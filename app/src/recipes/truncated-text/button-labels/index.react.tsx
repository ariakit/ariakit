import {
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { TruncatedText } from "@ariakit/ui/components/truncated-text.ariakit.react";
import { HistoryIcon } from "lucide-react";
import { useId } from "react";

const searches = [
  "invoices",
  "invoices from Northwind Traders paid after the due date",
  "refund requests",
  "orders to Lisbon without a tracking number",
];

export default function Example() {
  const headingId = useId();
  return (
    // Drag the corner to make the panel narrower or wider.
    <Frame
      render={<section aria-labelledby={headingId} />}
      $layer
      $lighten
      $border
      $rounded="xl"
      $p={2}
      className="grid w-64 max-w-full min-w-40 resize-x grid-cols-1 gap-1 overflow-hidden"
    >
      <h2 id={headingId} className="px-2 pt-1 text-sm font-medium">
        Recent searches
      </h2>
      <ul className="grid grid-cols-1">
        {searches.map((search) => (
          <li key={search} className="grid">
            {/* The button is the anchor, so the tooltip shows on keyboard
                focus. Only its label cuts the text off. */}
            <Tooltip text={search} placement="right" fitViewport>
              <Button className="min-w-0 justify-start">
                <ButtonSlot aria-hidden>
                  <HistoryIcon />
                </ButtonSlot>
                <TruncatedText render={<ButtonLabel />}>{search}</TruncatedText>
              </Button>
            </Tooltip>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
