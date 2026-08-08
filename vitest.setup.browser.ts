import "@ariakit/test/vitest";
import "./app/src/styles/global.css";
import { beforeEach } from "vitest";
import { userEvent } from "vitest/browser";

if (!Symbol.dispose) {
  Object.defineProperty(Symbol, "dispose", {
    value: Symbol("Symbol.dispose"),
  });
}

beforeEach(async () => {
  await userEvent.unhover(document.body);
});
