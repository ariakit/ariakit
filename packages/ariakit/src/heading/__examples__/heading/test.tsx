import { getByRole, render } from "ariakit-test-utils";
import Example from ".";

test("render heading", () => {
  render(<Example />);
  expect(getByRole("heading-container")).toMatchInlineSnapshot(`
  <div
    class="headingContainer"
    role="heading-container"
  >
    <h1>
      Lacus Et Semper Turpis Massa Commodo Cum
    </h1>
    <p>
      Torquent penatibus ipsum nascetur cursus primis lobortis
    </p>
    <h2>
      Ac Nullam
    </h2>
    <p>
      Volutpat metus id purus dignissim fusce Tellus egestas.
    </p>
    <h2>
      Quis Placerat
    </h2>
    <p>
      Platea justo lectus. Praesent. Et sodales pellentesque
    </p>
  </div>
  `);
});
