import type { DepInfo } from "./source-plugin.ts";

declare module "*?source" {
  const content: DepInfo;
  export default content;
}
