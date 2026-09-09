import { elements } from "@ariakit/components/role/role";
import { Role } from "@ariakit/react";
import { Role as ComponentRole } from "@ariakit/react-components/role/role";
import { Role as SubpathRole } from "@ariakit/react/role";
import "./types.react.ts";
import { expect, test } from "vitest";

test("exports every helper with native props and refs", () => {
  for (const element of elements) {
    expect(Role[element]).toBeDefined();
    expect(Role[element]).toBe(SubpathRole[element]);
    expect(Role[element]).toBe(ComponentRole[element]);
  }
});
