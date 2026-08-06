import { q, render } from "@ariakit/test/react";
import { expect, test } from "vitest";
import { Tab, TabList, TabPanel, Tabs } from "./tabs.react.tsx";

// Regression coverage: TabsProps extends RoleProps, but the wrapper spread
// onto a raw div, so a render prop compiled yet never rendered and leaked an
// unknown-prop warning.
test("renders through the render prop", async () => {
  const { unmount } = await render(
    <Tabs render={<section />}>
      <TabList tabs={["One"]} />
      <TabPanel single>Panel</TabPanel>
    </Tabs>,
  );
  expect(document.querySelector("section")).toBeInTheDocument();
  unmount();
});

// Regression coverage: tabs-prop entries rendered without React keys, which
// warned and reconciled by index.
test("keys the tabs prop entries", async () => {
  const { unmount } = await render(
    <Tabs>
      <TabList tabs={{ one: "One", two: { children: "Two" } }} />
      <TabPanel single>Panel</TabPanel>
    </Tabs>,
  );
  expect(q.tab.all().map((tab) => tab.textContent)).toEqual(["One", "Two"]);
  unmount();
});

// Regression coverage: index-keyed Fragment wrappers once demoted keyed
// element entries to positional reconciliation, so reordering relabeled
// nodes instead of moving them.
test("reconciles keyed array tab entries by their own key", async () => {
  const getTabs = (ids: string[]) => (
    <Tabs>
      <TabList
        tabs={ids.map((id) => (
          <Tab key={id} id={id}>
            {id}
          </Tab>
        ))}
      />
      <TabPanel single>Panel</TabPanel>
    </Tabs>
  );
  const { rerender, unmount } = await render(getTabs(["a", "b"]));
  const [initialFirst] = q.tab.all();
  await rerender(getTabs(["b", "a"]));
  const reordered = q.tab.all();
  expect(reordered.map((tab) => tab.textContent)).toEqual(["b", "a"]);
  expect(reordered[1]).toBe(initialFirst);
  unmount();
});

// Regression coverage: the array path once used raw element keys as
// Fragment keys, so an explicit key "0" collided with the positional key
// of an unkeyed sibling.
test("keeps explicit keys from colliding with positional keys", async () => {
  const getTabs = (reversed: boolean) => {
    const entries = [
      "Plain",
      <Tab key="0" id="zero">
        Zero
      </Tab>,
    ];
    return (
      <Tabs>
        <TabList tabs={reversed ? [...entries].reverse() : entries} />
        <TabPanel single>Panel</TabPanel>
      </Tabs>
    );
  };
  const { rerender } = await render(getTabs(false));
  const zeroTab = q.tab("Zero");
  await rerender(getTabs(true));
  expect(q.tab("Zero")).toBe(zeroTab);
});
