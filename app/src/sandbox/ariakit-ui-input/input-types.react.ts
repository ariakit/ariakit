import type { InputProps } from "@ariakit/ui/components/input.ariakit.react";
import { expectTypeOf } from "vitest";

// https://github.com/ariakit/ariakit/pull/7491#discussion_r4000904483
expectTypeOf<"$disabled">().not.toExtend<keyof InputProps>();
expectTypeOf<InputProps["disabled"]>().toEqualTypeOf<boolean | undefined>();
