import { Role } from "@ariakit/react";
import { Role as ComponentRole } from "@ariakit/react-components/role/role";
import { Role as SubpathRole } from "@ariakit/react/role";
import { expect, test } from "vitest";
import "./types.react.ts";
import { elements } from "./elements.ts";

test("exports every helper with native props and refs", () => {
  for (const element of elements) {
    expect(Role[element]).toBeDefined();
    expect(Role[element]).toBe(SubpathRole[element]);
    expect(Role[element]).toBe(ComponentRole[element]);
  }
});
