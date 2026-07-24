import * as Ariakit from "@ariakit/react";
import { startTransition, useMemo, useState } from "react";
import { countries } from "./countries.ts";
import "./style.css";

const defaultCountry = "Afghanistan";
const restoreSentinel = "Zimbabwe";

export default function Example() {
  const [searchValue, setSearchValue] = useState("");

  const matches = useMemo(() => {
    const query = searchValue.toLowerCase();
    return countries.filter((country) => country.toLowerCase().includes(query));
  }, [searchValue]);

  return (
    <div className="root">
      <Ariakit.ComboboxProvider
        defaultSelectedValue={defaultCountry}
        resetValueOnHide
        setValue={(value) => {
          startTransition(() => setSearchValue(value));
        }}
      >
        <Ariakit.ComboboxSelectLabel className="label">
          Country
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect className="button" />
        <Ariakit.ComboboxPopover
          className="popover"
          gutter={4}
          sameWidth
          unmountOnHide
        >
          <div className="combobox-wrapper">
            <Ariakit.ComboboxInput
              aria-label="Search countries"
              autoSelect
              className="combobox"
              placeholder="Search countries"
            />
          </div>
          <Ariakit.ComboboxList>
            {matches.map((country) => (
              <Ariakit.ComboboxItem
                key={country}
                className="popover-item"
                data-restore-sentinel={
                  country === restoreSentinel ? "" : undefined
                }
                value={country}
              />
            ))}
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </div>
  );
}
