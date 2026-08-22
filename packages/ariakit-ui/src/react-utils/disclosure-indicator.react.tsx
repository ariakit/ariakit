import { ChevronDownIcon } from "lucide-react";
import { disclosureChevron, disclosurePlus } from "../styles/disclosure.ts";

export type DisclosureIndicator =
  | "chevron-down-start"
  | "chevron-down-next"
  | "chevron-down-end"
  | "chevron-right-start"
  | "chevron-right-next"
  | "chevron-right-end"
  | "plus-start"
  | "plus-next"
  | "plus-end";

/**
 * Renders the disclosure button's open/close indicator, shared by the
 * ariakit and react-aria disclosure flavors so the two never drift.
 */
export function renderIndicator(indicator: DisclosureIndicator) {
  const className = indicator.endsWith("-end") ? "ms-auto" : undefined;
  if (indicator.startsWith("plus")) {
    return (
      <span data-disclosure-indicator {...disclosurePlus.jsx({ className })} />
    );
  }
  const $direction = indicator.startsWith("chevron-down") ? "down" : "right";
  return (
    <span
      data-disclosure-indicator
      {...disclosureChevron.jsx({ $direction, className })}
    >
      <ChevronDownIcon />
    </span>
  );
}
