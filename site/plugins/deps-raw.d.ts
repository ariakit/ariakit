import type { DepInfo } from "./deps-raw-plugin";

declare module "*?deps-raw" {
  const content: DepInfo;
  export default content;
}
