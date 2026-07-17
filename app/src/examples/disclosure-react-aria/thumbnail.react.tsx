import {
  disclosure,
  disclosureButton,
  disclosureChevron,
  disclosureContent,
  disclosureContentBody,
} from "@ariakit/ui/styles/disclosure.ts";
import { ChevronDownIcon } from "lucide-react";
import { PlaceholderText } from "#app/components/placeholder-text.react.tsx";

export default function Thumbnail() {
  return (
    <div className="h-full grid place-items-center-safe">
      {/* Static preview: data-open feeds the cv's open channel, and the
          interactive state variants are disabled so the card stays inert. */}
      <div
        data-open
        {...disclosure.jsx({
          class:
            "ak-frame ak-frame-card/card ak-layer ak-layer-lighten-6 ak-frame-bordering",
        })}
      >
        <div {...disclosureButton.jsx({ $focus: false, $active: false })}>
          <span {...disclosureChevron.jsx({ $direction: "right" })}>
            <ChevronDownIcon />
          </span>
          React Aria
        </div>
        <div {...disclosureContent.jsx({ class: "transition-none" })}>
          <div {...disclosureContentBody.jsx({})}>
            <PlaceholderText>
              Create an account, verify your email, and follow the setup wizard
              to create your first workspace.
            </PlaceholderText>
          </div>
        </div>
      </div>
    </div>
  );
}
