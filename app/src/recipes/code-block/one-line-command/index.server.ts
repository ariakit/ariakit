import { highlight } from "@ariakit/ui/utils/highlight.server";

export function load() {
  return { code: highlight("npm install @ariakit/react", "bash") };
}
