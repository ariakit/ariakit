import { render } from "@ariakit/test";
import Example from "./index.js";

test("render horizontal separator", () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <hr
        aria-orientation="horizontal"
        class="separator"
        role="separator"
      />
    </div>
  `);
});
