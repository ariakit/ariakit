import type { ComponentType } from "react";

export async function importThumbnail(name: string) {
  const example = name.split("/").shift();
  try {
    const { default: Thumbnail } = await import(
      `../examples/${example}/thumbnail.react.tsx`
    );
    return Thumbnail as ComponentType;
  } catch (error) {
    console.log(`Missing thumbnail for ${name}`);
    return undefined;
  }
}
