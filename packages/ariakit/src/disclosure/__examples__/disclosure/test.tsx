import { click, render } from "ariakit-test-utils";
import Example from ".";

test("faq", () => {
  const { container } = render(<Example />);
  expect(container.getElementsByClassName("wrapper")[0]).toMatchInlineSnapshot(`
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
        What are Vegetables?
      </button>
      <div
        class="content"
        hidden=""
        id="r:0"
        style="display: none;"
      >
        <ul>
          <li>
            🍎 Apple
          </li>
          <li>
            🍇 Grape
          </li>
          <li>
            🍊 Orange
          </li>
        </ul>
      </div>
    </div>
  `);
});

test("show or hide answer", async () => {
  const { container } = render(<Example />);
  const button = container.getElementsByClassName("button")[0]!;
  const content = container.getElementsByClassName("content")[0]!;
  expect(content).not.toBeVisible();
  await click(button);
  expect(content).toBeVisible();
  await click(button);
  expect(content).not.toBeVisible();
});
