// Type contracts of the recipe prop on the disclosure and button components.
// pnpm tsc checks this file; it renders nothing.
import type { ButtonProps } from "@ariakit/ui/components/button.ariakit.react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import type { DisclosureProps } from "@ariakit/ui/components/disclosure.ariakit.react";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContentBody,
} from "@ariakit/ui/components/disclosure.ariakit.react";
import { button } from "@ariakit/ui/styles/button";
import { disclosure } from "@ariakit/ui/styles/disclosure";
import { navDisclosureContentBody } from "@ariakit/ui/styles/nav";
import { cv } from "clava";
import { expectTypeOf } from "vitest";

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
  // @ts-expect-error A recipe must supply every base variant.
  recipe={cv({ variants: { $other: { a: "other" } } })}
/>;

// https://github.com/ariakit/ariakit/issues/7585
<DisclosureContentBody recipe={navDisclosureContentBody} $forceRounded />;
<Disclosure
  // @ts-expect-error The body recipe shares variants with the root recipe but
  // does not supply $split and the other root variants.
  recipe={navDisclosureContentBody}
/>;
// A recipe that adds variants has to come with the props that use them, or the
// base recipe would drop those variants at runtime.
expectTypeOf<{ $split: true }>().toExtend<DisclosureProps>();
expectTypeOf<{ $tone: "quiet" }>().not.toExtend<
  DisclosureProps<typeof sidebarDisclosure>
>();
expectTypeOf<{
  recipe: typeof sidebarDisclosure;
  $tone: "quiet";
}>().toExtend<DisclosureProps<typeof sidebarDisclosure>>();

// https://github.com/ariakit/ariakit/issues/7585
// A wrapper resolves an optional recipe before it forwards it, as clava's
// README says.
function ForwardedDisclosure({ recipe }: { recipe?: typeof disclosure }) {
  return <Disclosure recipe={recipe ?? disclosure} $split />;
}
<ForwardedDisclosure />;
// A recipe in a spread is checked like a recipe attribute.
function SpreadDisclosure(props: { recipe: typeof navDisclosureContentBody }) {
  // @ts-expect-error The body recipe does not supply every root variant.
  return <Disclosure {...props} />;
}
<SpreadDisclosure recipe={navDisclosureContentBody} />;

// https://github.com/ariakit/ariakit/pull/7587#discussion_r4075703035
const kindOnlyButton = cv({
  variants: { $kind: { flat: "kind-flat", bevel: "kind-bevel" } },
});
<Button
  // @ts-expect-error An independent recipe that shares $kind with a compatible
  // value domain still does not supply every button variant.
  recipe={kindOnlyButton}
/>;

// https://github.com/ariakit/ariakit/pull/7587#discussion_r4075703003
const themedButton = cv({
  extend: [button],
  variants: { $tone: { quiet: "themed-quiet" } },
});
expectTypeOf<{ $tone: "quiet" }>().not.toExtend<
  ButtonProps<typeof themedButton>
>();
expectTypeOf<{
  recipe: typeof themedButton;
  $tone: "quiet";
}>().toExtend<ButtonProps<typeof themedButton>>();
