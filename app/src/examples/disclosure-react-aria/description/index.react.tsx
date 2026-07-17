import { Heading } from "@ariakit/ui/html/heading.react.tsx";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "@ariakit/ui/react-aria/disclosure.react.tsx";
import { badge, badgeLabel } from "@ariakit/ui/styles/badge.ts";
import { prose } from "@ariakit/ui/styles/prose.ts";

// Prose content body, with the rhythm capped at the disclosure frame padding
// like the legacy ak-prose-gap-[min(var(--ak-frame-padding),--spacing(4))].
const proseBody = prose.jsx({
  $gap: "min(var(--ak-frame-padding), calc(var(--spacing) * 4))",
});

// The badge cvs are spread on spans rather than rendering the Badge
// component (a div) because the description renders inside the button, where
// only phrasing content is valid.
const badgeProps = badge.jsx({ $layer: "brand" });
const badgeLabelProps = badgeLabel.jsx({});

export default function Example() {
  const description = (
    <>
      <span className="flex items-center gap-2">
        <span>Expires 10/27</span>
        <span {...badgeProps}>
          <span {...badgeLabelProps}>Default</span>
        </span>
      </span>
      <span>Last used Sep 6, 2025</span>
    </>
  );

  return (
    <div className="w-200 max-w-[100cqi] grid gap-4">
      <Heading className="text-center">Payment methods</Heading>
      <Disclosure
        split
        className="ak-frame ak-frame-card/card ak-layer ak-layer-lighten-6 ak-frame-bordering @container"
      >
        <DisclosureButton
          indicator="chevron-down-end"
          className="text-lg"
          description={description}
        >
          Visa •••• •••• •••• 3421
        </DisclosureButton>
        <DisclosureContent body={proseBody}>
          <div className="p-(--disclosure-padding)">
            {/* The weight and margin restate what the legacy prose heading
                styles applied; the heading cv is skipped because its
                ak-ink-100 would beat the muted ink by stylesheet order. */}
            <h4 className="text-sm ak-ink-60 font-medium mb-[0.5em]">
              Recent charges
            </h4>
            <p className="ak-ink-80">Example details content...</p>
          </div>
        </DisclosureContent>
      </Disclosure>
    </div>
  );
}
