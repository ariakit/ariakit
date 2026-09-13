import type {
  InputGroupProps,
  InputProps,
} from "@ariakit/ui/components/input.ariakit.react";
import { Input, InputGroup } from "@ariakit/ui/components/input.ariakit.react";
import { expectTypeOf } from "vitest";

// https://github.com/ariakit/ariakit/pull/7491#discussion_r4000904483
expectTypeOf<"$disabled">().not.toExtend<keyof InputProps>();
expectTypeOf<"$disabled">().not.toExtend<keyof InputGroupProps>();
expectTypeOf<InputProps["disabled"]>().toEqualTypeOf<boolean | undefined>();

// https://github.com/ariakit/ariakit/pull/7491#discussion_r4000920891
const nativeProps = {
  onClick(event) {
    expectTypeOf(event.currentTarget).toEqualTypeOf<
      EventTarget & HTMLInputElement
    >();
    event.currentTarget.select();
  },
  ref(element) {
    expectTypeOf(element).toEqualTypeOf<HTMLInputElement | null>();
  },
} satisfies InputProps;
<Input {...nativeProps} />;

// https://github.com/ariakit/ariakit/pull/7491#discussion_r4000920891
<InputGroup
  onClick={(event) => {
    expectTypeOf(event.currentTarget).toEqualTypeOf<
      EventTarget & HTMLDivElement
    >();
    // @ts-expect-error The composed root is a div, not its nested input.
    event.currentTarget.select();
  }}
  ref={(element) => {
    expectTypeOf(element).toEqualTypeOf<HTMLDivElement | null>();
  }}
>
  <input />
</InputGroup>;
