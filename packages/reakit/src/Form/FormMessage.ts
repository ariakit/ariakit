import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { useHook } from "../system/useHook";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { As, PropsWithAs } from "../__utils/types";
import { unstable_FormStateReturn, useFormState } from "./FormState";
import { unstable_getIn } from "./utils/getIn";
import { getMessageId } from "./__utils/getMessageId";
import { shouldShowError } from "./__utils/shouldShowError";
import { shouldShowMessage } from "./__utils/shouldShowMessage";
import { DeepPath } from "./__utils/types";

export type unstable_FormMessageOptions<
  V,
  P extends DeepPath<V, P>
> = unstable_BoxOptions &
  Partial<unstable_FormStateReturn<V>> &
  Pick<unstable_FormStateReturn<V>, "touched" | "errors" | "messages"> & {
    /** TODO: Description */
    name: P;
  };

export type unstable_FormMessageProps = unstable_BoxProps;

export function useFormMessage<V, P extends DeepPath<V, P>>(
  options: unstable_FormMessageOptions<V, P>,
  htmlProps: unstable_FormMessageProps = {}
) {
  let children = shouldShowError(options, options.name)
    ? unstable_getIn(options.errors, options.name)
    : undefined;
  children =
    children ||
    (shouldShowMessage(options, options.name)
      ? unstable_getIn(options.messages, options.name)
      : undefined);

  htmlProps = mergeProps(
    {
      role: "alert",
      id: getMessageId(options.name, options.baseId),
      children
    },
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useFormMessage", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_FormMessageOptions<any, any>> = [
  ...useBox.keys,
  ...useFormState.keys,
  "name"
];

useFormMessage.keys = keys;

export const FormMessage = (unstable_createComponent(
  "div",
  useFormMessage
) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "div">(
  props: PropsWithAs<unstable_FormMessageOptions<V, P>, T>
) => JSX.Element;
