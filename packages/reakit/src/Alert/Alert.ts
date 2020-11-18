import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { shallowEqual } from "reakit-utils/shallowEqual";
import { useDisclosureContent } from "reakit/Disclosure";
import { ALERT_KEYS } from "./__keys";

export type AlertOptions = {
  /**
   * Options passed to `reakit-system-*`
   * @private
   */
  unstable_system?: any;
  visible: boolean;
};

export type AlertHTMLProps = React.HTMLAttributes<any> &
  React.RefAttributes<any> & {
    /**
     * Function returned by the hook to wrap the element to which html props
     * will be passed.
     */
    wrapElement?: (element: React.ReactNode) => React.ReactNode;
    open?: boolean;
    role?: "alert" | "status" | React.HTMLAttributes<any>["role"];
  };

export type AlertProps = AlertOptions & AlertHTMLProps;

export const useAlert = createHook<AlertOptions, AlertHTMLProps>({
  name: "Alert",
  compose: useDisclosureContent,
  useComposeOptions({ visible = true, ...options }) {
    return { ...options, visible };
  },
  useComposeProps({ visible }, { open = visible, ...htmlProps }) {
    return { ...htmlProps, open };
  },
  keys: ALERT_KEYS,
  propsAreEqual(prev, next) {
    const { unstable_system: prevSystem, ...prevProps } = prev;
    const { unstable_system: nextSystem, ...nextProps } = next;
    if (prevSystem !== nextSystem && !shallowEqual(prevSystem, nextSystem)) {
      return false;
    }
    return shallowEqual(prevProps, nextProps);
  },
  useProps(_, { role = "alert", ...htmlProps }) {
    return { ...htmlProps, role };
  },
});

export const Alert = createComponent({
  as: "dialog",
  useHook: useAlert,
});
