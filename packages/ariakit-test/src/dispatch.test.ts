import { expect, test } from "vitest";
import { dispatch, press } from "./index.ts";

test("dispatch.keyDown uses empty strings for omitted keyboard strings", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let key: string | undefined;
  let code: string | undefined;
  button.addEventListener("keydown", (event) => {
    key = event.key;
    code = event.code;
  });
  try {
    await dispatch.keyDown(button);
    expect(key).toBe("");
    expect(code).toBe("");
  } finally {
    button.remove();
  }
});

test("dispatch.keyDown preserves provided keyboard strings", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let key: string | undefined;
  let code: string | undefined;
  button.addEventListener("keydown", (event) => {
    key = event.key;
    code = event.code;
  });
  try {
    await dispatch.keyDown(button, { key: "m", code: "KeyM" });
    expect(key).toBe("m");
    expect(code).toBe("KeyM");
  } finally {
    button.remove();
  }
});

test("press uses an empty string for omitted keyboard code", async () => {
  const button = document.createElement("button");
  document.body.append(button);
  let key: string | undefined;
  let code: string | undefined;
  button.addEventListener("keydown", (event) => {
    key = event.key;
    code = event.code;
  });
  try {
    await press("m", button);
    expect(key).toBe("m");
    expect(code).toBe("");
  } finally {
    button.remove();
  }
});

test("press.ArrowUp uses an empty inputType when stepping a number input", async () => {
  const input = document.createElement("input");
  input.type = "number";
  input.value = "5";
  document.body.append(input);
  let inputType: string | undefined;
  input.addEventListener("input", (event) => {
    if (event instanceof InputEvent) {
      inputType = event.inputType;
    }
  });
  try {
    await press.ArrowUp(input);
    expect(input.value).toBe("6");
    expect(inputType).toBe("");
  } finally {
    input.remove();
  }
});

test("dispatch.input preserves provided inputType", async () => {
  const input = document.createElement("input");
  document.body.append(input);
  let inputType: string | undefined;
  input.addEventListener("input", (event) => {
    if (event instanceof InputEvent) {
      inputType = event.inputType;
    }
  });
  try {
    await dispatch.input(input, { inputType: "insertReplacementText" });
    expect(inputType).toBe("insertReplacementText");
  } finally {
    input.remove();
  }
});
