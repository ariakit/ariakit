import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_IdStateReturn, unstable_useIdState } from "./IdState";
import { unstable_IdContext, generateRandomString } from "./IdProvider";

export type unstable_IdOptions = BoxOptions &
  Pick<Partial<unstable_IdStateReturn>, "baseId" | "unstable_idCountRef"> & {
    /**
     * TODO: Description
     */
    id?: string;
  };

export type unstable_IdHTMLProps = BoxHTMLProps;

export type unstable_IdProps = unstable_IdOptions & unstable_IdHTMLProps;

export const unstable_useId = createHook<
  unstable_IdOptions,
  unstable_IdHTMLProps
>({
  name: "Id",
  compose: useBox,
  useState: unstable_useIdState,

  useOptions(options, htmlProps) {
    const generateId = React.useContext(unstable_IdContext);

    const [suffix] = React.useState(() => {
      if (options.unstable_idCountRef) {
        options.unstable_idCountRef.current += 1;
        return `-${options.unstable_idCountRef.current}`;
      }
      if (generateId !== generateRandomString && options.baseId) {
        return `-${generateId("")}`;
      }
      return "";
    });

    const [baseId] = React.useState(() => options.baseId || generateId());

    const id = htmlProps.id || `${baseId}${suffix}`;

    return { id, ...options };
  },

  useProps(options, { id, ...htmlProps }) {
    return { id: id || options.id, ...htmlProps };
  }
});

export const unstable_Id = createComponent({
  as: "div",
  useHook: unstable_useId
});
