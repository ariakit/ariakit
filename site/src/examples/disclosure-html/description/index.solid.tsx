import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "#app/examples/_lib/html/disclosure.solid.tsx";

export default function Example() {
  const description = (
    <>
      <span class="flex items-center gap-2">
        <span>Expires 10/27</span>
        <span class="ak-badge-primary">
          <span>Default</span>
        </span>
      </span>
      <span>Last used Sep 6, 2025</span>
    </>
  );

  return (
    <div class="w-200 max-w-[100cqi] grid gap-4">
      <h2 class="ak-heading text-center">Payment methods</h2>
      <Disclosure split class="ak-frame-card ak-layer ak-bordering @container">
        <DisclosureButton
          indicator="chevron-down-end"
          class="text-lg"
          description={description}
        >
          Visa •••• •••• •••• 3421
        </DisclosureButton>
        <DisclosureContent prose>
          <div class="p-(--ak-disclosure-padding)">
            <h4 class="text-sm ak-text/60">Recent charges</h4>
            <p class="ak-text/80">Example details content...</p>
          </div>
        </DisclosureContent>
      </Disclosure>
    </div>
  );
}
