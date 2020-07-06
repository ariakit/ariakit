import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { warning } from "reakit-warning";
import { useForkRef } from "reakit-utils/useForkRef";
import {
  CompositeItemOptions,
  CompositeItemHTMLProps,
  useCompositeItem,
} from "../Composite/CompositeItem";
import { unstable_useGridState as useGridState } from "./GridState";

export type unstable_GridCellOptions = CompositeItemOptions & {
  colSpan?: number;
};

export type unstable_GridCellHTMLProps = CompositeItemHTMLProps &
  React.TdHTMLAttributes<any>;

export type unstable_GridCellProps = unstable_GridCellOptions &
  unstable_GridCellHTMLProps;

function useIsNativeCell(ref: React.RefObject<HTMLElement>) {
  const [isNativeCell, setIsNativeCell] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) {
      warning(
        true,
        "Can't determine whether the element is a native cell because `ref` wasn't passed to the component",
        "See https://reakit.io/docs/grid"
      );
      return;
    }
    if (element.tagName === "TD") {
      setIsNativeCell(false);
    }
  }, []);
  return isNativeCell;
}

function useColSpan(
  ref: React.RefObject<HTMLElement>,
  options: unstable_GridCellOptions
) {
  const { id } = options;
  const trulyDisabled = options.disabled && !options.focusable;

  React.useEffect(() => {
    if (!options.colSpan || !id) return;
    for (let i = 0; i < options.colSpan - 1; i++) {
      options.registerItem?.({ id, ref, disabled: !!trulyDisabled });
    }
  }, [options.colSpan, id, options.registerItem, ref, trulyDisabled]);
}

export const unstable_useGridCell = createHook<
  unstable_GridCellOptions,
  unstable_GridCellHTMLProps
>({
  name: "GridCell",
  compose: useCompositeItem,
  useState: useGridState,

  useOptions(options, { colSpan }) {
    return {
      colSpan,
      ...options,
    };
  },

  useProps(options, { ref: htmlRef, ...htmlProps }) {
    const ref = React.useRef<HTMLElement>(null);
    // const isNativeCell = useIsNativeCell(ref);

    // useColSpan(ref, options);

    return {
      ref: useForkRef(ref, htmlRef),
      role: "gridcell",
      ...htmlProps,
    };
  },
});

export const unstable_GridCell = createComponent({
  as: "span",
  memo: true,
  useHook: unstable_useGridCell,
});
