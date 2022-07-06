import { fireEvent, getAllByLabelText, getByRole, render } from "ariakit-test";
import Example from ".";

const getNativeSelect = () => getAllByLabelText("Role")[0]!;
const getSelect = () => getByRole("combobox", { name: "Role" });

test("select has data-autofill attribute", async () => {
  render(<Example />);
  expect(getSelect()).not.toHaveAttribute("data-autofill");
  fireEvent.change(getNativeSelect(), { target: { value: "Tutor" } });
  expect(getSelect()).toHaveAttribute("data-autofill");
});
