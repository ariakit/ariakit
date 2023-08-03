import * as React from "react";
import * as Ariakit from "@ariakit/react";
import invariant from "tiny-invariant";

const TooltipContext = React.createContext<Ariakit.TooltipStore | null>(null);

export interface TooltipProviderProps extends Ariakit.TooltipStoreProps {
  children?: React.ReactNode;
}

export function TooltipProvider({ children, ...props }: TooltipProviderProps) {
  const store = Ariakit.useTooltipStore(props);
  return (
    <TooltipContext.Provider value={store}>{children}</TooltipContext.Provider>
  );
}

export interface TooltipAnchorProps
  extends Omit<Ariakit.TooltipAnchorProps, "store"> {}

export const TooltipAnchor = React.forwardRef<
  HTMLDivElement,
  TooltipAnchorProps
>(function TooltipAnchor(props, ref) {
  const store = React.useContext(TooltipContext);
  invariant(store, "TooltipAnchor must be used within TooltipProvider");
  return <Ariakit.TooltipAnchor ref={ref} {...props} store={store} />;
});

export interface TooltipProps extends Omit<Ariakit.TooltipProps, "store"> {}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const store = React.useContext(TooltipContext);
    invariant(store, "Tooltip must be used within TooltipProvider");
    return (
      <Ariakit.Tooltip ref={ref} className="tooltip" {...props} store={store} />
    );
  },
);
