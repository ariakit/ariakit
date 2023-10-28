declare module "*.png";
declare module "react-toastify/dist/ReactToastify.css";

declare module "next/link.js" {
  import Link from "next/dist/client/link.js";
  export * from "next/dist/client/link.js";
  export default Link["default"];
}

declare module "next/image.js" {
  import Image from "next/dist/shared/lib/image-external.js";
  export * from "next/dist/shared/lib/image-external.js";
  export default Image["default"];
}
