import * as Ariakit from "@ariakit/react";

function BaseElementStatus() {
  const store = Ariakit.useComboboxContext();
  const baseElement = store?.useState("baseElement");
  return (
    <output aria-label="Composite base element">
      {baseElement?.getAttribute("role")}
    </output>
  );
}

function WorkaroundComboboxList() {
  const store = Ariakit.useComboboxContext();
  return (
    <Ariakit.ComboboxList
      // TODO: Remove after https://github.com/ariakit/ariakit/issues/6868
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.currentTarget !== event.target) return;
        if (event.key !== "ArrowDown") return;
        const firstId = store?.first();
        if (firstId === undefined) return;
        event.preventDefault();
        store.move(firstId);
      }}
    >
      <Ariakit.ComboboxItem value="Apple" />
      <Ariakit.ComboboxItem value="Banana" />
      <Ariakit.ComboboxItem value="Orange" />
    </Ariakit.ComboboxList>
  );
}

export default function Example() {
  return (
    <>
      <Ariakit.ComboboxProvider
        defaultSelectedValue="Apple"
        virtualFocus={false}
      >
        <Ariakit.ComboboxSelectLabel>
          Favorite fruit
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover gutter={4}>
          <Ariakit.ComboboxInput aria-label="Search fruits" />
          <button type="button">Review options</button>
          <WorkaroundComboboxList />
        </Ariakit.ComboboxPopover>
        <BaseElementStatus />
      </Ariakit.ComboboxProvider>
      <button type="button">After select</button>
    </>
  );
}
