import type { ImageProps as NextImageProps } from "next/image.js";
import Image from "next/image.js";
import { twJoin } from "tailwind-merge";

type Src = NextImageProps["src"];
type SrcObject = { light: Src; dark: Src };

interface ImageProps extends Omit<NextImageProps, "src"> {
  src: Src | SrcObject;
}

function isSrcObject(src: Src | SrcObject): src is SrcObject {
  return typeof src === "object" && "light" in src;
}

export function ThemeImage({ src, ...props }: ImageProps) {
  if (!isSrcObject(src)) {
    return <Image src={src} {...props} />;
  }
  return (
    <>
      <Image
        {...props}
        src={src.light}
        className={twJoin(props.className, "block dark:hidden")}
      />
      <Image
        {...props}
        src={src.dark}
        className={twJoin(props.className, "hidden dark:block")}
      />
    </>
  );
}
