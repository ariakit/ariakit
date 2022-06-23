import { getByTestId } from "@testing-library/dom";
import { getByRole, getByText, press, render } from "ariakit-test";
import { FocusTrapRegion } from "ariakit/focus-trap";
import Example from ".";

test("correctly traps focus in region", async () => {
  // Focus trap is on by default in the Example
  render(
    <div>
      <div tabIndex={0}>Before</div>
      <Example />
      <div tabIndex={0}>After</div>
    </div>
  );
  await press.Tab();
  expect(getByText("Before")).toHaveFocus();
  await press.Tab();
  expect(getByRole("checkbox")).toHaveFocus();
  await press.Space(getByRole("checkbox"));
  await press.Tab();
  expect(getByRole("button", { name: "Button 1" })).toHaveFocus();
  await press.Tab();
  expect(getByRole("button", { name: "Button 2" })).toHaveFocus();
  await press.Tab();
  expect(getByRole("textbox", { name: "one" })).toHaveFocus();
  await press.Tab();
  // looped
  expect(getByRole("checkbox")).toHaveFocus();
});

test("correctly releases focus from region", async () => {
  // Focus trap is on by default in the Example
  render(
    <div>
      <div tabIndex={0}>Before</div>
      <Example />
      <div tabIndex={0}>After</div>
    </div>
  );
  await press.Tab();
  expect(getByText("Before")).toHaveFocus();
  await press.Tab();
  expect(getByRole("checkbox")).toHaveFocus();
  await press.Space(getByRole("checkbox"));
  await press.Tab();
  expect(getByRole("button", { name: "Button 1" })).toHaveFocus();
  await press.Tab();
  expect(getByRole("button", { name: "Button 2" })).toHaveFocus();
  await press.Tab();
  expect(getByRole("textbox", { name: "one" })).toHaveFocus();
  await press.Tab();
  await press.Space(getByRole("checkbox"));
  await press.Tab();
  await press.Tab();
  await press.Tab();
  await press.Tab();
  expect(getByText("After")).toHaveFocus();
});

test("correctly fallbacks to container if no focusable elements are found", async () => {
  const { container } = render(
    <div>
      <div tabIndex={0}>Before</div>
      <FocusTrapRegion tabIndex={-1} data-testid="region" enabled />
      <div tabIndex={0}>After</div>
    </div>
  );
  await press.Tab();
  expect(getByText("Before")).toHaveFocus();
  await press.Tab();
  expect(getByTestId(container, "region")).toHaveFocus();
  // focus remains on the container
  await press.Tab();
  expect(getByTestId(container, "region")).toHaveFocus();
});
