import { cleanup } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, test } from "vitest";
import { q, render } from "./react.tsx";
import { type } from "./type.ts";

afterEach(cleanup);

test("type fills an uncontrolled email input", async () => {
  await render(<input type="email" aria-label="Email" />);

  await type("ada@example.com", q.textbox("Email"));

  expect(q.textbox("Email")).toHaveValue("ada@example.com");
  expect(q.textbox("Email")).toHaveAttribute("type", "email");
});

test("type fills a controlled email input", async () => {
  const Test = () => {
    const [value, setValue] = useState("");
    return (
      <input
        type="email"
        aria-label="Email"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    );
  };

  await render(<Test />);

  await type("ada@example.com", q.textbox("Email"));

  expect(q.textbox("Email")).toHaveValue("ada@example.com");
  expect(q.textbox("Email")).toHaveAttribute("type", "email");
});

test("type fills an email input that re-renders on keypress", async () => {
  const Test = () => {
    const [, setPressCount] = useState(0);
    return (
      <input
        type="email"
        aria-label="Email"
        onKeyPress={() => setPressCount((pressCount) => pressCount + 1)}
      />
    );
  };

  await render(<Test />);

  await type("ada@example.com", q.textbox("Email"));

  expect(q.textbox("Email")).toHaveValue("ada@example.com");
  expect(q.textbox("Email")).toHaveAttribute("type", "email");
});
