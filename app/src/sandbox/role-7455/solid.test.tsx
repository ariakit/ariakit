import { Role } from "@ariakit/solid";
import { Role as ComponentRole } from "@ariakit/solid-components/role/role";
import { Role as SubpathRole } from "@ariakit/solid/role";
import { expect, test } from "vitest";
import "./types.solid.tsx";
import { elements } from "./elements.ts";

test("exports every helper with native props and refs", () => {
  for (const element of elements) {
    expect(Role[element]).toBeDefined();
    expect(Role[element]).toBe(SubpathRole[element]);
    expect(Role[element]).toBe(ComponentRole[element]);
  }
});
