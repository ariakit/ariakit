import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "#app/examples/_lib/html/disclosure.solid.tsx";

export default function Example() {
  return (
    <div class="w-100 max-w-[100cqi]">
      <Disclosure defaultOpen class="ak-frame-card ak-layer ak-bordering">
        <DisclosureButton>How do I get started?</DisclosureButton>
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
