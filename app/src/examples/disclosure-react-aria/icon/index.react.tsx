import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "@ariakit/ui/react-aria/disclosure.react.tsx";
import * as icons from "lucide-react";

export default function Example() {
  return (
    <div className="w-100 max-w-[100cqi]">
      <Disclosure
        defaultExpanded
        $iconSize={5}
        className="ak-frame ak-frame-card/card ak-layer ak-layer-lighten-6 ak-frame-bordering"
      >
        <DisclosureButton
          icon={<icons.Rocket className="ak-text ak-text-brand" />}
        >
          How do I get started?
        </DisclosureButton>
        <DisclosureContent prose>
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
