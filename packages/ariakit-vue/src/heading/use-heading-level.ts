import { Ref, computed, inject, provide, ref } from "vue-demi";
import { unwrap } from "../utils";

import { HeadingContextKey, HeadingLevel } from "./use-heading";

export interface UseHeadingLevelOptions {
  level?: HeadingLevel | Ref<HeadingLevel>;
}

export const useHeadingLevel = (props: UseHeadingLevelOptions) => {
  const unwrappedLevel = unwrap(props, "level");
  const contextLevel = inject(HeadingContextKey, ref(0));
  const nextLevel = computed(
    () =>
      Math.max(
        Math.min(unwrappedLevel.value || contextLevel.value + 1, 6),
        1
      ) as HeadingLevel
  );
  provide(HeadingContextKey, nextLevel);
};
