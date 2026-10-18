// @vitest-environment jsdom

import { afterEach, expect, test } from "vitest";
import { type } from "./index.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

test("type keeps appending after focus moves to an email input", async () => {
  const button = document.createElement("button");
  const input = document.createElement("input");
  input.type = "email";
  document.body.append(button, input);
  button.addEventListener("keydown", () => input.focus());

  await type("e", input);
  await type("23", button);

  expect(input.value).toBe("e23");
  expect(input.type).toBe("email");
  expect(document.activeElement).toBe(input);

  await type("4", input);

  expect(input.value).toBe("e234");
  expect(input.type).toBe("email");
});
