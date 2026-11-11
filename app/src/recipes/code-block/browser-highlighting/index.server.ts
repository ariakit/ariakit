import { highlight } from "@ariakit/ui/utils/highlight.server";

export const initialCode = `export function Greeting({ name }) {
  return <p>Hello, {name}!</p>;
}`;

export function load() {
  return { initialCode, initialHtml: highlight(initialCode, "tsx").html };
}
