import type {
  ComboboxErrorProps,
  ComboboxInputProps,
  ComboboxProps,
} from "@ariakit/ui/components/combobox.ariakit.react";
import {
  ComboboxError,
  ComboboxProvider,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { Lock } from "lucide-react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { expectTypeOf } from "vitest";

// https://github.com/ariakit/ariakit/pull/7491#discussion_r4001152369
expectTypeOf<"$disabled">().not.toExtend<keyof ComboboxInputProps>();
expectTypeOf<"$disabled">().not.toExtend<keyof ComboboxProps>();
expectTypeOf<ComboboxInputProps["disabled"]>().toEqualTypeOf<
  boolean | undefined
>();
expectTypeOf<ComboboxProps["disabled"]>().toEqualTypeOf<boolean | undefined>();

// https://github.com/ariakit/ariakit/issues/8051
declare const setCurrency: Dispatch<SetStateAction<string>>;
declare const currencies: string[];
declare const setCurrencies: Dispatch<SetStateAction<string[]>>;
<ComboboxProvider selectedValue="USD" setSelectedValue={setCurrency} />;
<ComboboxProvider defaultSelectedValue="USD" setSelectedValue={setCurrency} />;
<ComboboxProvider
  selectedValue={currencies}
  setSelectedValue={setCurrencies}
/>;
<ComboboxProvider
  selectedValue="USD"
  setSelectedValue={(value) => {
    expectTypeOf(value).toEqualTypeOf<string>();
  }}
/>;
<ComboboxProvider
  setSelectedValue={(value) => {
    expectTypeOf(value).toEqualTypeOf<string | readonly string[]>();
  }}
/>;

// https://github.com/ariakit/ariakit/issues/8053
expectTypeOf<ComboboxErrorProps["icon"]>().toEqualTypeOf<ReactNode>();
<ComboboxError icon={<Lock />}>Choose a country.</ComboboxError>;
<ComboboxError icon={false}>Choose a country.</ComboboxError>;
<ComboboxError icon={null}>Choose a country.</ComboboxError>;
// @ts-expect-error The icon is an element, not a component.
<ComboboxError icon={Lock}>Choose a country.</ComboboxError>;
// @ts-expect-error The error renders its own children, so HTML goes in a child.
<ComboboxError dangerouslySetInnerHTML={{ __html: "<b>Required</b>" }} />;
<ComboboxError>
  <span dangerouslySetInnerHTML={{ __html: "<b>Required</b>" }} />
</ComboboxError>;
