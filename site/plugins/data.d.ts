import type { DepInfo } from "./data-plugin";

declare module "*?data" {
  const content: DepInfo;
  export default content;
}
