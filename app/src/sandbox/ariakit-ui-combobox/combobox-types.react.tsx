import type {
  ComboboxInputProps,
  ComboboxProps,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { ComboboxProvider } from "@ariakit/ui/components/combobox.ariakit.react";
import type { Dispatch, SetStateAction } from "react";
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
