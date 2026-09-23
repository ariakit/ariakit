// Type contracts of the list disclosure wrappers, which pass a recipe that
// extends the disclosure recipe to the framework component. pnpm tsc checks
// this file; it renders nothing.
import {
  ListDisclosure,
  ListDisclosureButton,
  ListDisclosureContent,
  ListDisclosureContentBody,
} from "@ariakit/ui/components/list.ariakit.react";
import { disclosureContentBody } from "@ariakit/ui/styles/disclosure";
import {
  listDisclosure,
  listDisclosureButton,
  listDisclosureContentBody,
} from "@ariakit/ui/styles/list";

// https://github.com/ariakit/ariakit/issues/7553
<ListDisclosure $leadingIcon $indent={2} $rounded="md" $px="lg" />;
<ListDisclosureButton $gap="auto" checked />;
<ListDisclosureContentBody $prose />;

// https://github.com/ariakit/ariakit/issues/7553
<ListDisclosure
  // @ts-expect-error Neither recipe has this variant.
  $nope
/>;
<ListDisclosureButton
  // @ts-expect-error Neither recipe has this variant.
  $nope
/>;
<ListDisclosureContentBody
  // @ts-expect-error Neither recipe has this variant.
  $nope
/>;

// https://github.com/ariakit/ariakit/issues/7553
<ListDisclosure
  // @ts-expect-error The wrapper fixes its recipe.
  recipe={listDisclosure}
/>;
<ListDisclosureButton
  // @ts-expect-error The wrapper fixes its recipe.
  recipe={listDisclosureButton}
/>;
<ListDisclosureContentBody
  // @ts-expect-error The wrapper fixes its recipe.
  recipe={listDisclosureContentBody}
/>;
<ListDisclosureContent
  // @ts-expect-error The body slot takes the list body's props.
  body={{ recipe: disclosureContentBody }}
/>;
<ListDisclosure
  // @ts-expect-error The body slot takes the list body's props.
  content={{ body: { recipe: disclosureContentBody } }}
/>;
