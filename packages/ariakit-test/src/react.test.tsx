import { cleanup } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { click } from "./click.ts";
import { q, render } from "./react.tsx";
import { type } from "./type.ts";

afterEach(cleanup);

// These lock in the cheap per-step `settle()` used between an interaction's
// sub-steps: a component's microtask/rAF-scheduled work must still flush between
// steps even though there's no wall-clock delay there anymore.

test("type fires a controlled onChange once per character, in order", async () => {
  const onChange = vi.fn<(value: string) => void>();
  function Controlled() {
    const [value, setValue] = useState("");
    return (
      <input
        aria-label="field"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setValue(event.target.value);
        }}
      />
    );
  }
  await render(<Controlled />);
  await type("abc", q.textbox("field"));
  // Each keystroke's controlled re-render must flush before the next one reads
  // the input value, so the accumulated value is correct and in order.
  expect(onChange.mock.calls.map((call) => call[0])).toEqual([
    "a",
    "ab",
    "abc",
  ]);
  expect(q.textbox("field")).toHaveValue("abc");
});

test("type reflects the full query in a controlled filter mid-typing", async () => {
  function Filter() {
    const [value, setValue] = useState("");
    const items = ["apple", "apricot", "banana"];
    return (
      <div>
        <input
          aria-label="filter"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <ul aria-label="results">
          {items
            .filter((item) => item.startsWith(value))
            .map((item) => (
              <li key={item} role="option">
                {item}
              </li>
            ))}
        </ul>
      </div>
    );
  }
  await render(<Filter />);
  await type("ap", q.textbox("filter"));
  expect(q.option.all()).toHaveLength(2);
  await type("r", q.textbox("filter"));
  expect(q.option.all()).toHaveLength(1);
  expect(q.option()).toHaveTextContent("apricot");
});

test("click toggles controlled state", async () => {
  function Toggle() {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <button onClick={() => setOpen((value) => !value)}>Toggle</button>
        {open && <div role="dialog" aria-label="panel" />}
      </div>
    );
  }
  await render(<Toggle />);
  expect(q.dialog.all()).toHaveLength(0);
  await click(q.button("Toggle"));
  expect(q.dialog("panel")).toBeInTheDocument();
  await click(q.button("Toggle"));
  expect(q.dialog.all()).toHaveLength(0);
});
