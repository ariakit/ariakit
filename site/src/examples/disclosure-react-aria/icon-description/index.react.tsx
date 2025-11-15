import * as icons from "lucide-react";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "#app/examples/_lib/react-aria/disclosure.react.tsx";

export default function Example() {
  return (
    <div className="w-100 max-w-[100cqi]">
      <Disclosure
        split
        className="ak-frame-card ak-layer ak-bordering ak-disclosure-icon-5"
      >
        <DisclosureButton
          icon={<icons.Rocket className="ak-text-primary" />}
          description="Account, email, setup"
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
