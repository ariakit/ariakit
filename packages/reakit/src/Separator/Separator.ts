import React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import { warning } from "reakit-warning";
import { RoleOptions, RoleHTMLProps, useRole } from "../Role/Role";
import { SEPARATOR_KEYS } from "./__keys";

export type SeparatorOptions = RoleOptions & {
  /**
   * Separator's orientation.
   */
  orientation?: "horizontal" | "vertical";
};

export type SeparatorHTMLProps = RoleHTMLProps;

export type SeparatorProps = SeparatorOptions & SeparatorHTMLProps;

export const useSeparator = createHook<SeparatorOptions, SeparatorHTMLProps>({
  name: "Separator",
  compose: useRole,
  keys: SEPARATOR_KEYS,

  useProps(options, { ref: htmlRef, ...htmlProps }) {
    const ref = React.useRef<HTMLElement>(null);
    const [role, setRole] = React.useState<"separator" | undefined>(undefined);

    React.useEffect(() => {
      const element = ref.current;
      if (!element) {
        warning(
          true,
          "Can't determine whether the element is a native hr because `ref` wasn't passed to the component",
          "See https://reakit.io/docs/separator/"
        );
        return;
      }

      if (element.tagName !== "HR") {
        setRole("separator");
      }
    }, []);

    return {
      ref: useForkRef(ref, htmlRef),
      role,
      "aria-orientation": options.orientation,
      ...htmlProps,
    };
  },
});

export const Separator = createComponent({
  as: "hr",
  memo: true,
  useHook: useSeparator,
});
