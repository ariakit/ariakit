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
      <div
        // Static open state: the data-open attribute feeds the open channel
        // the disclosure styles publish for descendants.
        data-open
        {...disclosure.jsx({
          className:
            "ak-frame ak-frame-card/card ak-layer ak-layer-lighten-6 ak-frame-bordering",
        })}
      >
        <div
          {...disclosureButton.jsx({
            // Decorative preview: the interactive state variants are
            // disabled so the fake button stays inert, like the legacy
            // idle-only utilities.
            $focus: false,
            $active: false,
          })}
        >
          <span {...disclosureChevron.jsx({ $direction: "right" })}>
            <ChevronDownIcon />
          </span>
          How do I get started?
        </div>
        <div {...disclosureContent.jsx({ className: "transition-none" })}>
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
