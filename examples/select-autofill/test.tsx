import {
  fireEvent,
  focus,
  getAllByLabelText,
  getByRole,
  render,
  waitFor,
} from "@ariakit/test";
import Example from "./index.jsx";

const getNativeSelect = () => getAllByLabelText("Role")[0]!;
const getSelect = () => getByRole("combobox", { name: "Role" });

test("select has data-autofill attribute", () => {
  render(<Example />);
  expect(getSelect()).not.toHaveAttribute("data-autofill");
  fireEvent.change(getNativeSelect(), { target: { value: "Tutor" } });
  expect(getSelect()).toHaveAttribute("data-autofill");
});

test("focusing on native select moves focus to custom select", async () => {
  render(<Example />);
  expect(getSelect()).not.toHaveFocus();
  focus(getNativeSelect());
  await waitFor(expect(getSelect()).toHaveFocus);
});
