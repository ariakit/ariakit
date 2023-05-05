declare module "next/link.js" {
  import Link from "next/dist/client/link.js";
  export * from "next/dist/client/link.js";
  export default Link["default"];
}
