import { click, getByRole, getByText, press, render } from "ariakit-test-utils";
import Example from ".";

const getContent = () => getByText(/Vegetables are parts of plants/);
const getDisclosure = () =>
  getByRole("button", { name: "What are vegetables?" });

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

test("show/hide on click", async () => {
  render(<Example />);
  expect(getContent()).not.toBeVisible();
  expect(getDisclosure()).toHaveAttribute("aria-expanded", "false");
  await click(getDisclosure());
  expect(getContent()).toBeVisible();
  expect(getDisclosure()).toHaveAttribute("aria-expanded", "true");
  await click(getDisclosure());
  expect(getContent()).not.toBeVisible();
  expect(getDisclosure()).toHaveAttribute("aria-expanded", "false");
});

test("show/hide on enter", async () => {
  render(<Example />);
  expect(getContent()).not.toBeVisible();
  await press.Tab();
  await press.Enter();
  expect(getContent()).toBeVisible();
  await press.Enter();
  expect(getContent()).not.toBeVisible();
});

test("show/hide on space", async () => {
  render(<Example />);
  expect(getContent()).not.toBeVisible();
  await press.Tab();
  await press.Space();
  expect(getContent()).toBeVisible();
  await press.Space();
  expect(getContent()).not.toBeVisible();
});
