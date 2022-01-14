import { render } from "ariakit-test-utils";
import Example from ".";

test("markup", () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="wrapper"
      >
        <button
          aria-controls="r:0"
          aria-expanded="false"
          class="button"
          data-command=""
          data-disclosure=""
          type="button"
        >
          What are vegetables?
        </button>
        <div
          class="content"
          hidden=""
          id="r:0"
          style="display: none;"
        >
          <p>
            Vegetables are parts of plants that are consumed by humans or other animals as food. The original meaning is still commonly used and is applied to plants collectively to refer to all edible plant matter, including the flowers, fruits, stems, leaves, roots, and seeds.
          </p>
        </div>
      </div>
    </div>
  `);
});
