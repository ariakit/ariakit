import * as Ariakit from "@ariakit/react";

const fruits = ["Apple", "Banana", "Orange"];

export default function Example() {
  return (
    <Ariakit.SelectProvider defaultValue={["Apple"]}>
      <Ariakit.SelectLabel>Favorite fruits</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover gutter={4} sameWidth>
        {fruits.map((fruit) => (
          <Ariakit.SelectItem
            key={fruit}
            value={fruit}
            render={(props) => {
              // TODO: Remove when https://github.com/ariakit/ariakit/issues/4567 is fixed.
              const selected =
                props["aria-selected"] === true ||
                props["aria-selected"] === "true";
              return (
                <div {...props}>
                  {props.children} ({selected ? "selected" : "not selected"})
                </div>
              );
            }}
          />
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
