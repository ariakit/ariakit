import { InjectionKey, Ref, computed, inject, ref } from "vue-demi";
import { Options, unwrap, useTagName } from "../utils";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export const HeadingContextKey: InjectionKey<Ref<HeadingLevel | 0>> =
  Symbol.for("heading");

export type UseHeadingOptions = Options;

export const useHeading = (
  node: Ref<HTMLElement | null>,
  props: UseHeadingOptions
) => {
  const headingContext = inject(HeadingContextKey, ref(0));
  const level = computed(() => headingContext.value || 1);
  const as = computed(
    () => unwrap(props, "as") || (`h${level.value}` as const)
  );
  const tagName = useTagName(node, as);

  const attributes = computed(() => {
    const isNativeHeading = /^h\d$/.test(tagName.value ?? "");

    return isNativeHeading
      ? {} // it's a native heading, we don't need to add a11y attributes
      : {
          role: "heading",
          "aria-level": level.value,
        };
  });

  return { as: tagName, attributes };
};
