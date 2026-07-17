import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "@ariakit/ui/ariakit/disclosure.react.tsx";
import { prose } from "@ariakit/ui/styles/prose.ts";

// Legacy DisclosureContent prose: the content body doubles as a prose column
// whose rhythm gap is capped by the frame padding.
const proseBody = prose.jsx({
  $gap: "min(var(--ak-frame-padding), calc(var(--spacing) * 4))",
});

export default function Example() {
  return (
    <div className="w-100 max-w-[100cqi]">
      <Disclosure
        defaultOpen
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
