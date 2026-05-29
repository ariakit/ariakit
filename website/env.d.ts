declare module "*.png";
declare module "react-toastify/dist/ReactToastify.css";

declare module "next/link.js" {
  import Link from "next/dist/client/link.ts";
  export * from "next/dist/client/link.ts";
  export default Link.default;
}

declare module "next/image.js" {
  import Image from "next/dist/shared/lib/image-external.ts";
  export * from "next/dist/shared/lib/image-external.ts";
  export default Image.default;
}
