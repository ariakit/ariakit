import { createContext, RefObject } from "react";
import { TooltipState } from "./tooltip-state";

export function createGlobalTooltipState() {
  type ListenerRef = RefObject<any>;
  type Listener = (ref: ListenerRef | null) => void;

  return {
    activeRef: null as ListenerRef | null,
    listeners: new Set<Listener>(),

    subscribe(listener: Listener) {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    },

    show(ref: ListenerRef | null) {
      this.activeRef = ref;
      this.listeners.forEach((listener) => listener(ref));
    },

    hide(ref: ListenerRef) {
      if (this.activeRef === ref) {
        this.activeRef = null;
        this.listeners.forEach((listener) => listener(null));
      }
    },
  };
}

export const TooltipContext = createContext<TooltipState | undefined>(
  undefined
);
