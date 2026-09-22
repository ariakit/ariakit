// Type contracts of the recipe prop on the disclosure and button components.
// pnpm tsc checks this file; it renders nothing.
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import type { DisclosureProps } from "@ariakit/ui/components/disclosure.ariakit.react";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContentBody,
} from "@ariakit/ui/components/disclosure.ariakit.react";
import { button } from "@ariakit/ui/styles/button";
import { disclosure } from "@ariakit/ui/styles/disclosure";
import { cv } from "clava";

// A consumer recipe that extends the disclosure recipe with a variant of its
// own and replaces some of its defaults.
const sidebarDisclosure = cv({
  extend: [disclosure],
  variants: { $tone: { quiet: "sidebar-quiet", loud: "sidebar-loud" } },
  defaultVariants: { $p: 3, $rounded: "xl", $slotGap: "var(--sidebar-gap)" },
});

function SidebarDisclosure(
  props: Omit<DisclosureProps<typeof sidebarDisclosure>, "recipe">,
) {
  return <Disclosure recipe={sidebarDisclosure} {...props} />;
}

// https://github.com/ariakit/ariakit/issues/7553
<Disclosure recipe={sidebarDisclosure} $tone="quiet" />;
<SidebarDisclosure $tone="loud" $slotGap={4} $rounded="md" />;
<SidebarDisclosure
  // @ts-expect-error The variant has no such value.
  $tone="muted"
/>;
<SidebarDisclosure
  // @ts-expect-error Neither recipe has this variant.
  $nope
/>;
<SidebarDisclosure
  // @ts-expect-error The wrapper fixes its recipe.
  recipe={disclosure}
/>;
<Disclosure
  // @ts-expect-error Without the consumer recipe, the base has no $tone.
  $tone="quiet"
/>;

// https://github.com/ariakit/ariakit/issues/7553
<Disclosure $slotGap={4} $bodyOffset="1rem" $indent={2} $leadingIcon={false} />;
<DisclosureButton $gap="auto" $transition={false} />;
<DisclosureContentBody $prose />;
<Button recipe={button} $rounded="lg" />;
<Button
  // @ts-expect-error A recipe must share the base's variants.
  recipe={cv({ variants: { $other: { a: "other" } } })}
/>;
