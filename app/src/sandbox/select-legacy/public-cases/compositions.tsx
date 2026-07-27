import * as Ariakit from "@ariakit/react";
import { useMemo, useState } from "react";
import { fruits } from "./shared.tsx";

export function LegacyPublicSelectMenuDefaultOpenCase() {
  const [showFilter, setShowFilter] = useState(false);
  return (
    <>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>
          Filters ({showFilter ? "1" : "0"})
        </Ariakit.MenuButton>
        <Ariakit.Menu>
          <Ariakit.MenuItem onClick={() => setShowFilter(true)}>
            Language
          </Ariakit.MenuItem>
          <Ariakit.MenuItem onClick={() => setShowFilter(false)}>
            Clear all
          </Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      {showFilter && (
        <Ariakit.SelectProvider defaultValue="" defaultOpen>
          <Ariakit.SelectLabel>Language filter</Ariakit.SelectLabel>
          <Ariakit.Select>
            <Ariakit.SelectValue fallback="Choose one" />
          </Ariakit.Select>
          <Ariakit.SelectPopover gutter={4}>
            <Ariakit.SelectItem value="English" />
            <Ariakit.SelectItem value="French" />
            <Ariakit.SelectItem value="German" />
          </Ariakit.SelectPopover>
        </Ariakit.SelectProvider>
      )}
    </>
  );
}

const alignments = ["Align Left", "Align Center", "Align Right"] as const;

export function LegacyPublicToolbarSelectCase() {
  const [value, setValue] = useState<string>("Align Left");
  return (
    <Ariakit.Toolbar>
      <Ariakit.ToolbarItem>Bold</Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem>Italic</Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem>Underline</Ariakit.ToolbarItem>
      <Ariakit.ToolbarSeparator />
      <Ariakit.SelectProvider value={value} setValue={setValue}>
        <Ariakit.Select
          aria-label="Legacy text alignment"
          render={<Ariakit.ToolbarItem />}
        >
          {value}
          <Ariakit.SelectArrow />
        </Ariakit.Select>
        <Ariakit.SelectPopover gutter={4}>
          {alignments.map((alignment) => (
            <Ariakit.SelectItem key={alignment} value={alignment} />
          ))}
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </Ariakit.Toolbar>
  );
}

interface LegacyFormSelectProps {
  name: Ariakit.FormControlProps["name"];
}

function LegacyFormSelect({ name }: LegacyFormSelectProps) {
  const form = Ariakit.useFormContext();
  if (!form) throw new Error("LegacyFormSelect must be used within a Form");
  const value = Ariakit.useFormValue<string>(form, name);
  const select = Ariakit.useSelectStore({
    value,
    setValue: (nextValue) => form.setValue(name, nextValue),
  });
  const selectValue = Ariakit.useStoreState(select, "value");
  const selectElement = (
    <Ariakit.Select store={select}>
      {selectValue || "Select an item"}
      <Ariakit.SelectArrow />
    </Ariakit.Select>
  );
  const field = <Ariakit.FormControl name={name} render={selectElement} />;
  return (
    <>
      <Ariakit.Role.button render={field} />
      <Ariakit.SelectPopover store={select} modal sameWidth gutter={4}>
        <Ariakit.SelectItem value="" />
        <Ariakit.SelectItem value="Apple" />
        <Ariakit.SelectItem value="Banana" />
        <Ariakit.SelectItem value="Orange" />
      </Ariakit.SelectPopover>
    </>
  );
}

export function LegacyPublicFormSelectCase() {
  const form = Ariakit.useFormStore({
    defaultValues: { name: "", fruit: "" },
  });
  Ariakit.useFormSubmit(form, () => {
    window.alert(JSON.stringify(form.getState().values));
  });
  return (
    <Ariakit.Form store={form}>
      <Ariakit.FormLabel name={form.names.name}>Legacy name</Ariakit.FormLabel>
      <Ariakit.FormInput
        name={form.names.name}
        required
        placeholder="John Doe"
      />
      <Ariakit.FormLabel name={form.names.fruit}>
        Legacy favorite fruit
      </Ariakit.FormLabel>
      <LegacyFormSelect name={form.names.fruit} />
      <Ariakit.FormError name={form.names.fruit} />
      <Ariakit.FormSubmit>Submit legacy custom form</Ariakit.FormSubmit>
    </Ariakit.Form>
  );
}

interface MultipleComboboxItemsProps {
  matches: readonly string[];
  select?: Ariakit.SelectStore;
}

function MultipleComboboxItems({
  matches,
  select,
}: MultipleComboboxItemsProps) {
  return (
    <>
      {matches.map((value) => (
        <Ariakit.SelectItem
          key={value}
          store={select}
          value={value}
          render={<Ariakit.ComboboxItem />}
        >
          <Ariakit.SelectItemCheck />
          {value}
        </Ariakit.SelectItem>
      ))}
    </>
  );
}

export function LegacyPublicComboboxMultipleSelectCase() {
  const [searchValue, setSearchValue] = useState("");
  const [values, setValues] = useState<string[]>(["Apple"]);
  const matches = useMemo(
    () =>
      fruits.filter((fruit) =>
        fruit.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    [searchValue],
  );
  return (
    <Ariakit.ComboboxProvider
      value={searchValue}
      setValue={setSearchValue}
      resetValueOnHide
    >
      <Ariakit.SelectProvider value={values} setValue={setValues}>
        <Ariakit.ComboboxLabel>
          Provider multiple legacy fruits
        </Ariakit.ComboboxLabel>
        <Ariakit.Combobox />
        <Ariakit.ComboboxPopover render={<Ariakit.SelectList />}>
          <MultipleComboboxItems matches={matches} />
        </Ariakit.ComboboxPopover>
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  );
}

export function LegacyPublicComboboxMultipleStoreCase() {
  const combobox = Ariakit.useComboboxStore({
    resetValueOnHide: true,
  });
  const select = Ariakit.useSelectStore({
    combobox,
    defaultValue: ["Apple"],
  });
  const searchValue = Ariakit.useStoreState(combobox, "value");
  const matches = useMemo(
    () =>
      fruits.filter((fruit) =>
        fruit.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    [searchValue],
  );
  return (
    <>
      <Ariakit.ComboboxLabel store={combobox}>
        Store multiple legacy fruits
      </Ariakit.ComboboxLabel>
      <Ariakit.Combobox store={combobox} />
      <Ariakit.ComboboxPopover
        store={combobox}
        render={<Ariakit.SelectList store={select} />}
      >
        <MultipleComboboxItems matches={matches} select={select} />
      </Ariakit.ComboboxPopover>
    </>
  );
}
