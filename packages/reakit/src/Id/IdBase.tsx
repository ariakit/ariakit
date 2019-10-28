import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_IdStateReturn, unstable_useIdState } from "./IdState";
import { unstable_IdContext } from "./IdProvider";

export type unstable_IdBaseOptions = BoxOptions &
  Pick<
    Partial<unstable_IdStateReturn>,
    "baseId" | "unstable_setBaseId" | "unstable_idCountRef"
  > & {
    /**
     * TODO: Description
     */
    id?: string;
  };

export type unstable_IdBaseHTMLProps = BoxHTMLProps;

export type unstable_IdBaseProps = unstable_IdBaseOptions &
  unstable_IdBaseHTMLProps;

export const unstable_useIdBase = createHook<
  unstable_IdBaseOptions,
  unstable_IdBaseHTMLProps
>({
  name: "IdBase",
  compose: useBox,
  useState: unstable_useIdState,

  useOptions(options, htmlProps) {
    const generateId = React.useContext(unstable_IdContext);
    const [id] = React.useState(
      () => htmlProps.id || options.baseId || generateId()
    );

    if (options.unstable_setBaseId && id !== options.baseId) {
      options.unstable_setBaseId(id);
    }

    return { id, ...options };
  },

  useProps(options, { id, ...htmlProps }) {
    return { id: id || options.id, ...htmlProps };
  }
});

export const unstable_IdBase = createComponent({
  as: "div",
  useHook: unstable_useIdBase
});
