import { RoleHTMLProps, RoleOptions } from "reakit/Role/Role";
import { usePalette } from "./utils/palette";
import { useContrast } from "./utils/contrast";

export type PaletteRoleOptions = RoleOptions & {
  unstable_system: {
    palette?: string;
    fill?: "opaque" | "outline";
  };
};

export function useRoleProps(
  { unstable_system: system = {} }: PaletteRoleOptions,
  { style: htmlStyle, ...htmlProps }: RoleHTMLProps = {}
) {
  const color = usePalette(system.palette);
  const contrast = useContrast(color);
  const textColor = system.fill === "opaque" ? contrast : color;
  const backgroundColor = system.fill === "opaque" ? color : undefined;
  const borderColor = system.fill === "outline" ? color : undefined;
  const style = {} as React.CSSProperties;

  if (textColor) {
    style.color = textColor;
  }
  if (backgroundColor) {
    style.backgroundColor = backgroundColor;
  }
  if (borderColor) {
    style.border = `1px solid ${borderColor}`;
    style.borderColor = borderColor;
  }

  return { style: { ...style, ...htmlStyle }, ...htmlProps };
}
