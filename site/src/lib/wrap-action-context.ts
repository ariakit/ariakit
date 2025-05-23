import type { ActionAPIContext } from "astro:actions";
import type { APIContext } from "astro";

export function wrapActionContext(context: ActionAPIContext) {
  return context as APIContext;
}
