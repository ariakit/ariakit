import type {
  InputErrorProps,
  InputGroupProps,
  InputProps,
} from "@ariakit/ui/components/input.ariakit.react";
import {
  Input,
  InputError,
  InputGroup,
} from "@ariakit/ui/components/input.ariakit.react";
import { inputErrorIcon } from "@ariakit/ui/styles/input";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
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

// https://github.com/ariakit/ariakit/issues/8053
expectTypeOf<InputErrorProps["icon"]>().toEqualTypeOf<ReactNode>();
<InputError icon={<Lock />}>This account is locked.</InputError>;
<InputError icon={false}>This account is locked.</InputError>;
<InputError icon={null}>This account is locked.</InputError>;
// @ts-expect-error The icon is an element, not a component.
<InputError icon={Lock}>This account is locked.</InputError>;
// @ts-expect-error The error renders its own children, so HTML goes in a child.
<InputError dangerouslySetInnerHTML={{ __html: "Enter an <b>email</b>." }} />;
<InputError>
  <span dangerouslySetInnerHTML={{ __html: "Enter an <b>email</b>." }} />
</InputError>;

// Frame variants show the error on a panel.
<InputError $layer="danger" $mix={15} $rounded="lg" $p={3}>
  Choose an answer.
</InputError>;

// The error icon takes its size from --field-error-icon-size, so the inherited
// slot size variant would have no effect.
// @ts-expect-error The icon part has no $size variant.
inputErrorIcon.jsx({ $size: "lg" });
