import { q, render } from "../react.tsx";

test("matches names split across descendant elements", () => {
  render(
    <>
      <button role="tab">
        Examples
        <span>31</span>
      </button>
      <div role="option">
        <span>Default</span>
        <span aria-hidden="true">✓</span>
        <span>checked</span>
      </div>
    </>,
  );

  expect(q.tab("Examples 31")).toBeInTheDocument();
  expect(q.option("Default checked")).toBeInTheDocument();
});
