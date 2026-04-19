import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "#app/examples/_lib/react-aria/disclosure.react.tsx";

export default function Example() {
  const description = (
    <>
      <span className="flex items-center gap-2">
        <span>Expires 10/27</span>
        <span className="ak-badge-primary">
          <span>Default</span>
        </span>
      </span>
      <span>Last used Sep 6, 2025</span>
    </>
  );

  return (
    <div className="w-200 max-w-[100cqi] grid gap-4">
      <h2 className="ak-heading text-center">Payment methods</h2>
      <Disclosure
        split
        className="ak-frame-card ak-layer ak-bordering @container"
      >
        <DisclosureButton
          indicator="chevron-down-end"
          className="text-lg"
          description={description}
        >
          Visa •••• •••• •••• 3421
        </DisclosureButton>
        <DisclosureContent prose>
          <div className="p-(--ak-disclosure-padding)">
            <h4 className="text-sm ak-text/60">Recent charges</h4>
            <p className="ak-text/80">Example details content...</p>
          </div>
        </DisclosureContent>
      </Disclosure>
    </div>
  );
}
