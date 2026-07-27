import * as Ariakit from "@ariakit/react";

const fruits = ["Apple", "Banana", "Grape", "Orange"];

interface AnimatedSelectProps {
  label: string;
  store?: Ariakit.ComboboxStore;
}

function AnimatedSelect({ label, store }: AnimatedSelectProps) {
  return (
    <div>
      <Ariakit.ComboboxSelectLabel store={store}>
        {label}
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={store} />
      <Ariakit.ComboboxPopover
        store={store}
        portal
        sameWidth
        unmountOnHide
        gutter={4}
        style={{
          opacity: 1,
          transition: "opacity 100ms, scale 100ms, translate 100ms",
        }}
      >
        {fruits.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
    </div>
  );
}

function StoreAnimatedSelect() {
  const store = Ariakit.useComboboxStore({
    defaultSelectedValue: "Apple",
    virtualFocus: true,
  });
  const mounted = Ariakit.useStoreState(store, "mounted");
  return (
    <div>
      <Ariakit.ComboboxSelectLabel store={store}>
        Store favorite fruit
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={store} />
      {mounted && (
        <Ariakit.ComboboxPopover
          store={store}
          portal
          sameWidth
          gutter={4}
          style={{
            opacity: 1,
            transition: "opacity 100ms, scale 100ms, translate 100ms",
          }}
        >
          {fruits.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxPopover>
      )}
    </div>
  );
}

export default function Example() {
  return (
    <main style={{ minHeight: 1_000, paddingTop: 120 }}>
      <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
        <AnimatedSelect label="Favorite fruit" />
      </Ariakit.ComboboxProvider>
      <StoreAnimatedSelect />
    </main>
  );
}
