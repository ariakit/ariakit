import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
  DisclosureGroup,
} from "#app/examples/_lib/react-aria/disclosure.react.tsx";

export default function Example() {
  return (
    <div className="w-140 max-w-[100cqi] grid gap-4">
      <h2 className="ak-heading text-center">Frequently Asked Questions</h2>
      <DisclosureGroup>
        <Disclosure>
          <DisclosureButton indicator="plus-end">
            How do I access Ariakit Plus after purchasing?
          </DisclosureButton>
          <DisclosureContent prose>
            <p>
              After you create your account and complete payment, you will get
              immediate access to Ariakit Plus features. Your purchase is linked
              to your account, so if you are signed out, just log back in to
              restore access.
            </p>
            <p>
              If you run into any issues with your account, contact us at{" "}
              <a href="mailto:contact@ariakit.com">contact@ariakit.com</a>.
            </p>
          </DisclosureContent>
        </Disclosure>
        <Disclosure>
          <DisclosureButton indicator="plus-end">
            What do &quot;lifetime access&quot; and &quot;free updates&quot;
            mean?
          </DisclosureButton>
          <DisclosureContent prose>
            <p>
              Lifetime access and free updates mean you pay once and get all
              current and future Ariakit Plus features. Think of it like buying
              a game and getting all future DLC for free, forever.
            </p>
          </DisclosureContent>
        </Disclosure>
        <Disclosure>
          <DisclosureButton indicator="plus-end">
            How does the Team license work?
          </DisclosureButton>
          <DisclosureContent prose>
            <p>
              When you purchase a team license, you can invite up to 10 people
              (including you) by entering their email addresses at checkout or
              later in the dashboard.
            </p>
            <p>
              Team members have the same access as an individual license holder
              while they are on the team. If they are removed, they lose access
              and the right to use the license on any project.
            </p>
          </DisclosureContent>
        </Disclosure>
        <Disclosure>
          <DisclosureButton indicator="plus-end">
            Can I upgrade to a Team license later?
          </DisclosureButton>
          <DisclosureContent prose>
            <p>
              Yes. If you purchased an individual license, you can upgrade to a
              Team license later at a discount. Go to the checkout page, sign in
              to your account, and the discount applies automatically.
            </p>
            <p>
              The discount applies only if you upgrade in the same currency as
              your original purchase. If you cannot use the same currency,
              contact us at{" "}
              <a href="mailto:contact@ariakit.com">contact@ariakit.com</a>.
            </p>
          </DisclosureContent>
        </Disclosure>
        <Disclosure>
          <DisclosureButton indicator="plus-end">
            Can I use Ariakit Plus for multiple projects?
          </DisclosureButton>
          <DisclosureContent prose>
            <p>
              Yes, a single Ariakit Plus license lets you build multiple
              commercial websites, as long as they are custom sites developed
              for you, your company, or individual clients.
            </p>
            <p>
              You are not allowed to create a project, site, or template that is
              resold to multiple clients, since that would constitute
              redistribution of the code. For more information, read the{" "}
              <a href="https://ariakit.com/plus/license">license</a>.
            </p>
          </DisclosureContent>
        </Disclosure>
      </DisclosureGroup>
    </div>
  );
}
