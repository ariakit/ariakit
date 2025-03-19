import { cn } from "../lib/cn.ts";

export interface PlaceholderTextProps {
  children: string;
  layer?: string;
  weight?: "light" | "normal" | "medium" | "bold";
}

export function PlaceholderText({
  children,
  layer,
  weight = "normal",
}: PlaceholderTextProps) {
  const weightMap = {
    light: "ak-layer-pop-parent",
    normal: "ak-layer-pop-parent-2",
    medium: "ak-layer-pop-parent-4",
    bold: "ak-layer-pop-parent-6",
  };
  return (
    <div
      className={cn(
        layer ?? weightMap[weight],
        "!text-transparent !bg-transparent select-none px-2 ak-frame",
      )}
    >
      {children.split("").map((char, index) => (
        <span
          key={index}
          className="bg-(--ak-layer) rounded-[inherit] px-2 -mx-2"
        >
          {char}
        </span>
      ))}
    </div>
  );
}
