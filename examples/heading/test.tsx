import { render } from "@ariakit/test";
import Example from "./index.js";

test("markup", () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
  <div>
    <div
      class="wrapper"
    >
      <h1>
        Heading 1
      </h1>
      <p>
        Torquent penatibus ipsum nascetur cursus primis lobortis
      </p>
      <h2>
        Heading 2
      </h2>
      <p>
        Volutpat metus id purus dignissim fusce Tellus egestas.
      </p>
      <h2>
        Heading 2
      </h2>
      <p>
        Platea justo lectus. Praesent. Et sodales pellentesque
      </p>
    </div>
  </div>
  `);
});
