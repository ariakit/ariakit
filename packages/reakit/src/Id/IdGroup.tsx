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
     * TODO: Description
     */
    id?: string;
  };

// TODO: Probably IdGroup shouldn't set options.baseId as the id prop
// Other components will have the choice to do this
// But if id is passed to IdGroup, then baseId should be set (setBaseId)
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

  useOptions(options, htmlProps) {
    const generateId = React.useContext(unstable_IdContext);
    const [id] = React.useState(
      () => htmlProps.id || options.id || options.baseId || generateId()
    );

    // If there's useIdState and IdGroup has received a different id, then set
    // the baseId on the state.
    if (options.unstable_setBaseId && id !== options.baseId) {
      options.unstable_setBaseId(id);
    }

    return { ...options, id };
  },

  useProps(options, { id, ...htmlProps }) {
    return { id: id || options.id, ...htmlProps };
  }
});

export const unstable_IdGroup = createComponent({
  as: "div",
  useHook: unstable_useIdGroup
});
