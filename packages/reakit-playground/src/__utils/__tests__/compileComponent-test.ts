import { compileComponent } from "../compileComponent";

// TODO: More tests
test("compileComponent", () => {
  const code = `
    import { Button } from "reakit";

    function Example() {
      return <Button>Button</Button>;
    }
  `;
  expect(compileComponent(code)).toMatchInlineSnapshot(`<Example />`);
});
