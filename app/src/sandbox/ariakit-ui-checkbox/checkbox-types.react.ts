import type {
  CheckboxCardCheckProps,
  CheckboxCardProps,
  CheckboxFieldProps,
  CheckboxProps,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import type {
  RadioCardCheckProps,
  RadioProps,
} from "@ariakit/ui/components/radio.ariakit.react";
import { expectTypeOf } from "vitest";

// The components that own the input can set its role from the switch mark.
expectTypeOf<"switch">().toExtend<CheckboxProps["$mark"]>();
expectTypeOf<"switch">().toExtend<CheckboxFieldProps["$mark"]>();
expectTypeOf<"switch">().toExtend<CheckboxCardProps["$mark"]>();

// A card's check doesn't own the input, so it takes the mark from its card.
expectTypeOf<"switch">().not.toExtend<CheckboxCardCheckProps["$mark"]>();

// A click can't turn a radio off, so it can't look like a switch.
expectTypeOf<"switch">().not.toExtend<RadioProps["$mark"]>();
expectTypeOf<"switch">().not.toExtend<RadioCardCheckProps["$mark"]>();
