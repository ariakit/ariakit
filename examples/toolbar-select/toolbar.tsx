import * as React from "react";
import * as Ariakit from "@ariakit/react";

export const Toolbar = React.forwardRef<
  HTMLDivElement,
  Omit<Ariakit.ToolbarProps, "store">
>(function Toolbar(props, ref) {
  const toolbar = Ariakit.useToolbarStore();
  return (
    <Ariakit.Toolbar ref={ref} className="toolbar" {...props} store={toolbar} />
  );
});

export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  Ariakit.ToolbarItemProps
>(function ToolbarButton(props, ref) {
  return <Ariakit.ToolbarItem ref={ref} className="button" {...props} />;
});

export const ToolbarSeparator = React.forwardRef<
  HTMLHRElement,
  Ariakit.ToolbarSeparatorProps
>(function ToolbarSeparator(props, ref) {
  return (
    <Ariakit.ToolbarSeparator ref={ref} className="separator" {...props} />
  );
});
