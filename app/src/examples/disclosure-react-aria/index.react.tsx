import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "@ariakit/ui/react-aria/disclosure.react.tsx";
import { prose } from "@ariakit/ui/styles/prose.ts";

// Prose content body, with the rhythm capped at the disclosure frame padding
// like the legacy ak-prose-gap-[min(var(--ak-frame-padding),--spacing(4))].
const proseBody = prose.jsx({
  $gap: "min(var(--ak-frame-padding), calc(var(--spacing) * 4))",
});

export default function Example() {
  return (
    <div className="w-100 max-w-[100cqi]">
      <Disclosure
        defaultExpanded
        className="ak-frame ak-frame-card/card ak-layer ak-layer-lighten-6 ak-frame-bordering"
      >
        <DisclosureButton>How do I get started?</DisclosureButton>
        <DisclosureContent body={proseBody}>
          <p>
            Create an account, verify your email, and follow the setup wizard to
            create your first workspace.
          </p>
          <p>
            The onboarding checklist guides you through adding teammates,
            connecting integrations, and importing sample data.
          </p>
        </DisclosureContent>
      </Disclosure>
    </div>
  );
}
