import { render } from "ariakit-test";
import Example from ".";

test("markup", () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
  <div>
    <div
      class="wrapper"
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
  </div>
  `);
});
