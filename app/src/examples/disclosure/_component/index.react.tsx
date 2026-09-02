import * as ak from "@ariakit/react";
import {
  disclosure,
  disclosureButton,
  disclosureChevron,
  disclosureContent,
  disclosureContentBody,
} from "@ariakit/ui/styles/disclosure.ts";
import { prose } from "@ariakit/ui/styles/prose.ts";
import { ChevronDownIcon } from "lucide-react";

export default function Example() {
  return (
    <div className="w-100 max-w-[100cqi]">
      <ak.DisclosureProvider defaultOpen>
        <div
          {...disclosure.jsx({
            $rounded: "xl",
            $p: 4,
            $lighten: true,
            $border: true,
            // The plain wrapper reads the open state from the Ariakit
            // content's data-open attribute and forwards it to the open
            // channel the disclosure styles publish for descendants.
            className: "has-data-open:[--disclosure-open:1]",
          })}
        >
          <ak.Disclosure {...disclosureButton.jsx({})}>
            <span {...disclosureChevron.jsx({ $direction: "right" })}>
              <ChevronDownIcon />
            </span>
            How do I get started?
          </ak.Disclosure>
          <ak.DisclosureContent {...disclosureContent.jsx({})}>
            <div
              {...disclosureContentBody.jsx(
                prose.jsx({ $gap: "var(--ak-frame-padding)" }),
              )}
            >
              <p>
                Create an account, verify your email, and follow the setup
                wizard to create your first workspace.
              </p>
              <p>
                The onboarding checklist guides you through adding teammates,
                connecting integrations, and importing sample data.
              </p>
            </div>
          </ak.DisclosureContent>
        </div>
      </ak.DisclosureProvider>
    </div>
  );
}
