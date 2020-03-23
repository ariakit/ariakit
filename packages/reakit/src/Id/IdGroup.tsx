import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_IdStateReturn, unstable_useIdState } from "./IdState";
import { unstable_IdContext } from "./IdProvider";

export type unstable_IdGroupOptions = BoxOptions &
  Pick<
    Partial<unstable_IdStateReturn>,
    "baseId" | "unstable_setBaseId" | "unstable_idCountRef"
  > & {
    /**
     * Same as the HTML attribute.
     */
    id?: string;
  };

export type unstable_IdGroupHTMLProps = BoxHTMLProps;

export type unstable_IdGroupProps = unstable_IdGroupOptions &
  unstable_IdGroupHTMLProps;

export const unstable_useIdGroup = createHook<
  unstable_IdGroupOptions,
  unstable_IdGroupHTMLProps
>({
  name: "IdGroup",
  compose: useBox,
  useState: unstable_useIdState,
  keys: ["id"],

  useOptions(options, htmlProps) {
    const generateId = React.useContext(unstable_IdContext);
    const [baseId] = React.useState(
      () => htmlProps.id || options.id || options.baseId || generateId()
    );

    React.useEffect(() => {
      // If there's useIdState and IdGroup has received a different id, then set
      // the baseId on the state.
      if (baseId !== options.baseId) {
        options.unstable_setBaseId?.(baseId);
      }
    }, [options.unstable_setBaseId, baseId, options.baseId]);

    return { ...options, baseId };
  },

  useProps(options, htmlProps) {
    return { id: options.id, ...htmlProps };
  }
});

export const unstable_IdGroup = createComponent({
  as: "div",
  useHook: unstable_useIdGroup
});
