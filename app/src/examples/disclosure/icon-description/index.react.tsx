import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "@ariakit/ui/components/disclosure.ariakit.react.tsx";
import * as icons from "lucide-react";

export default function Example() {
  return (
    <div className="w-100 max-w-[100cqi]">
      <Disclosure split $iconSize={5} $rounded="xl" $p={4} $lighten $border>
        <DisclosureButton
          icon={<icons.Rocket className="ak-text ak-text-brand" />}
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
