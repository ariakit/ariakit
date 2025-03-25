import type { Source } from "./source-plugin.ts";

declare module "*?source" {
  const content: Source;
  export default content;
}
