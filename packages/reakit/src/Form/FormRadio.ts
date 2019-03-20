import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { useHook } from "../system/useHook";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { As, PropsWithAs } from "../__utils/types";
import { unstable_FormStateReturn, useFormState } from "./FormState";
import { unstable_getIn } from "./utils/getIn";
import { formatInputName } from "./__utils/formatInputName";
import { getInputId } from "./__utils/getInputId";
import { DeepPath, DeepPathValue } from "./__utils/types";

export type unstable_FormRadioOptions<
  V,
  P extends DeepPath<V, P>
> = unstable_BoxOptions &
  Partial<unstable_FormStateReturn<V>> &
  Pick<unstable_FormStateReturn<V>, "values" | "update" | "blur"> & {
    /** TODO: Description */
    name: P;
    /** TODO: Description */
    value: DeepPathValue<V, P>;
  };

export type unstable_FormRadioProps = unstable_BoxProps;

export function useFormRadio<V, P extends DeepPath<V, P>>(
  options: unstable_FormRadioOptions<V, P>,
  htmlProps: unstable_FormRadioProps = {}
) {
  const currentChecked = unstable_getIn(options.values, options.name);
  const checked = currentChecked === options.value;

  htmlProps = mergeProps(
    {
      checked,
      "aria-checked": checked,
      role: "radio",
      type: "radio",
      tabIndex: checked || !currentChecked ? 0 : -1,
      name: formatInputName(options.name),
      value: options.value,
      onChange: () => options.update(options.name, options.value),
      onBlur: () => options.blur(options.name),
      onFocus: () => options.update(options.name, options.value),
      onKeyDown: event => {
        const groupId = getInputId(options.name, options.baseId);
        if (!groupId) return;
        const group = document.getElementById(groupId);
        if (!group) return;
        const radios = group.querySelectorAll<HTMLElement>("[role=radio]");
        if (!radios.length) return;

        const radiosArray = Array.from(radios);
        const currentIdx = radiosArray.indexOf(event.target as HTMLElement);
        const lastIdx = radiosArray.length - 1;
        const nextIdx = currentIdx === lastIdx ? 0 : currentIdx + 1;
        const previousIdx = currentIdx === 0 ? lastIdx : currentIdx - 1;

        const keyMap = {
          ArrowRight: () => radiosArray[nextIdx].focus(),
          ArrowDown: () => radiosArray[nextIdx].focus(),
          ArrowLeft: () => radiosArray[previousIdx].focus(),
          ArrowUp: () => radiosArray[previousIdx].focus()
        };

        if (event.key in keyMap) {
          event.preventDefault();
          keyMap[event.key as keyof typeof keyMap]();
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useFormRadio", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_FormRadioOptions<any, any>> = [
  ...useBox.keys,
  ...useFormState.keys,
  "name",
  "value"
];

useFormRadio.keys = keys;

export const FormRadio = (unstable_createComponent(
  "input",
  useFormRadio
) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "input">(
  props: PropsWithAs<unstable_FormRadioOptions<V, P>, T>
) => JSX.Element;
