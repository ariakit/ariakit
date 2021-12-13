import { getByRole, hover, render } from "ariakit-test-utils";
import Example from ".";


test("render", async () => {
    const { container } = render(<Example />);
    await hover(container);
    expect(getByRole("tooltip")).toBeInTheDocument();
  });