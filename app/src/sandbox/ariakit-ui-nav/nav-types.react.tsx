// Type contracts of the nav wrappers, which pass a recipe that extends the
// disclosure or button recipe to the framework component. pnpm tsc checks this
// file; it renders nothing.
import type {
  NavDisclosureButtonProps,
  NavDisclosureContentProps,
  NavDisclosureProps,
} from "@ariakit/ui/components/nav.ariakit.react";
import {
  NavButton,
  NavDisclosure,
  NavDisclosureButton,
  NavDisclosureContent,
  NavDisclosureContentBody,
} from "@ariakit/ui/components/nav.ariakit.react";
import { disclosureContentBody } from "@ariakit/ui/styles/disclosure";
import {
  navButton,
  navDisclosure,
  navDisclosureButton,
  navDisclosureContentBody,
} from "@ariakit/ui/styles/nav";
import { expectTypeOf } from "vitest";

// https://github.com/ariakit/ariakit/issues/7553
<NavDisclosure $rounded="md" $slotGap={4} $bodyOffset={2} button="Docs" />;
<NavDisclosureButton $gap="auto" $focusOffset="inset" />;
<NavDisclosureContentBody $prose $forceRounded $p={2} />;
<NavButton $rounded="md" $gap="lg" />;

// https://github.com/ariakit/ariakit/issues/7553
<NavDisclosure
  // @ts-expect-error Neither recipe has this variant.
  $nope
/>;
<NavDisclosureButton
  // @ts-expect-error Neither recipe has this variant.
  $nope
/>;
<NavDisclosureContentBody
  // @ts-expect-error Neither recipe has this variant.
  $nope
/>;
<NavButton
  // @ts-expect-error Neither recipe has this variant.
  $nope
/>;

// https://github.com/ariakit/ariakit/issues/7553
<NavDisclosure
  // @ts-expect-error The wrapper fixes its recipe.
  recipe={navDisclosure}
/>;
<NavDisclosureButton
  // @ts-expect-error The wrapper fixes its recipe.
  recipe={navDisclosureButton}
/>;
<NavDisclosureContentBody
  // @ts-expect-error The wrapper fixes its recipe.
  recipe={navDisclosureContentBody}
/>;
<NavButton
  // @ts-expect-error The wrapper fixes its recipe.
  recipe={navButton}
/>;
<NavDisclosureContent
  // @ts-expect-error The body slot takes the nav body's props.
  body={{ recipe: disclosureContentBody }}
/>;
<NavDisclosure
  // @ts-expect-error The body slot takes the nav body's props.
  content={{ body: { recipe: disclosureContentBody } }}
/>;

// https://github.com/ariakit/ariakit/issues/7553
// The root narrows its button and content slots to the nav wrappers' props.
expectTypeOf<NavDisclosureButtonProps>().toExtend<
  NavDisclosureProps["button"]
>();
expectTypeOf<NavDisclosureContentProps>().toExtend<
  NavDisclosureProps["content"]
>();
<NavDisclosure
  button={{ $gap: "auto", label: "Docs" }}
  content={{ body: { $prose: true } }}
/>;
