import { Fragment, PropType, defineComponent, h, isVue3, ref } from "vue-demi";
import { As, refsToAttributes } from "../utils";
import { HeadingLevel, useHeading } from "./use-heading";
import { useHeadingLevel } from "./use-heading-level";

export { useHeading } from "./use-heading";
export { useHeadingLevel } from "./use-heading-level";

export const VHeading = defineComponent({
  props: {
    as: {
      type: [String, Object, Function] as PropType<As | undefined>,
      required: false,
    },
  },
  setup(props, { slots }) {
    const node = ref<HTMLElement | null>(null);
    const { as, attributes } = useHeading(node, props);

    return () =>
      h(
        /**
         * I can't figure out why the cast is necessary here.
         * The fallbacks are required because:
         * 1. as.value could be undefined in the case that `props.as` is defined and not a string (i.e. a component reference)
         * 2. props.as can be undefined. In practice this should fall back to `as.value` because `useHeading` will have a default
         * value in that case that will prevent falling back to `props.as`, so we can cast to string here to avoid it
         *
         * Theoretically the case shouldn't actually be necessary but there's some issue with the overload resolution and
         * I haven't spent enough time trying to figure it out or even with TS overloads, to be honest, in order to know
         * how best to start debugging the resolution issue here. It's a frustrating an mostly uninteresting issue that
         * looks like it might generally get in the way for these Vue component implementations. Tinker with minor and
         * edge case TypeScript detauls is not really what anyon should spend their time fighting with :(
         */
        (as.value || props.as) as string,
        { ref: node, ...refsToAttributes(attributes.value) },
        slots
      );
  },
});

export const VHeadingLevel = defineComponent({
  props: {
    level: {
      type: Number as PropType<HeadingLevel>,
      required: false,
    },
  },
  setup(props, { slots }) {
    useHeadingLevel(props);

    if (isVue3) {
      return () => h(Fragment, slots);
    }
    return () => h("div", slots);
  },
});
