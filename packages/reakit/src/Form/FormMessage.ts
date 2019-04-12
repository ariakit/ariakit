import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { As, PropsWithAs, Keys } from "../__utils/types";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";
import { unstable_getIn } from "./utils/getIn";
import { getMessageId } from "./__utils/getMessageId";
import { shouldShowError } from "./__utils/shouldShowError";
import { shouldShowMessage } from "./__utils/shouldShowMessage";
import { DeepPath } from "./__utils/types";

export type unstable_FormMessageOptions<
  V,
  P extends DeepPath<V, P>
> = BoxOptions &
  Pick<
    unstable_FormStateReturn<V>,
    "baseId" | "touched" | "errors" | "messages"
  > & {
    /** TODO: Description */
    name: P;
  };

export type unstable_FormMessageProps = BoxProps;

export function unstable_useFormMessage<V, P extends DeepPath<V, P>>(
  options: unstable_FormMessageOptions<V, P>,
  htmlProps: unstable_FormMessageProps = {}
) {
  options = unstable_useOptions("useFormMessage", options, htmlProps);

  let children = shouldShowError(options, options.name)
    ? unstable_getIn(options.errors, options.name as any)
    : undefined;
  children =
    children ||
    (shouldShowMessage(options, options.name)
      ? unstable_getIn(options.messages, options.name as any)
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
  htmlProps = unstable_useProps("useFormMessage", options, htmlProps);
  return htmlProps;
}

const keys: Keys<
  unstable_FormStateReturn<any> & unstable_FormMessageOptions<any, any>
> = [...useBox.__keys, ...unstable_useFormState.__keys, "name"];

unstable_useFormMessage.__keys = keys;

export const unstable_FormMessage = (unstable_createComponent({
  as: "div",
  useHook: unstable_useFormMessage
}) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "div">(
  props: PropsWithAs<unstable_FormMessageOptions<V, P>, T>
) => JSX.Element;
