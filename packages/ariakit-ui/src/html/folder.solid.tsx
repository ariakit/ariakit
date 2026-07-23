import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { folder } from "../styles/folder.ts";

export interface FolderProps
  extends ComponentProps<"div">, VariantProps<typeof folder> {}

/**
 * Renders a div that curves its bottom outer corners like a folder tab while
 * selected (e.g. `aria-selected="true"`), merging the tab into the panel
 * below. The folder kind owns the `::before`/`::after` pseudo elements.
 */
export function Folder(props: FolderProps) {
  const [variantProps, rest] = splitProps(props, folder.html.propKeys);
  // Default the kind so the component paints the folder-tab shape out of the
  // box; an explicit $kind prop still wins.
  return (
    <div
      {...folder.html({
        ...variantProps,
        $kind: variantProps.$kind ?? "folder",
      })}
      {...rest}
    />
  );
}
