import * as ak from "@ariakit/react";

export default function Example() {
  return (
    <div className="w-100 max-w-[100cqi]">
      <ak.DisclosureProvider defaultOpen>
        <div className="ak-disclosure has-data-open:ak-disclosure_open ak-layer ak-frame-card ak-bordering">
          <ak.Disclosure className="ak-disclosure-button before:ak-disclosure-chevron-right">
            How do I get started?
          </ak.Disclosure>
          <ak.DisclosureContent className="ak-disclosure-content">
            <div className="ak-prose ak-prose-gap-(--ak-frame-padding)">
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
