import type {
  ComboboxInputProps,
  ComboboxProps,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { expectTypeOf } from "vitest";

// https://github.com/ariakit/ariakit/pull/7491#discussion_r4001152369
expectTypeOf<"$disabled">().not.toExtend<keyof ComboboxInputProps>();
expectTypeOf<"$disabled">().not.toExtend<keyof ComboboxProps>();
expectTypeOf<ComboboxInputProps["disabled"]>().toEqualTypeOf<
  boolean | undefined
>();
expectTypeOf<ComboboxProps["disabled"]>().toEqualTypeOf<boolean | undefined>();
