import type { FileIconData } from "./file-icons.ts";

export interface FileIconProps {
  icon: FileIconData;
}

/**
 * Renders an icon from `getFileIcon` as the `icon` of a code block tab or
 * title. The parts in the color of a brand adapt it to the layer behind them,
 * so the icon keeps its contrast on any tab and in both color schemes.
 */
export function FileIcon({ icon }: FileIconProps) {
  return (
    <svg
      viewBox={icon.viewBox}
      // The markup comes from file-icons.ts, not from users.
      dangerouslySetInnerHTML={{ __html: icon.html }}
    />
  );
}
