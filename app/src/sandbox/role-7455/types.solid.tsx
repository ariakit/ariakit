import type { Role } from "@ariakit/solid";
import type { ComponentProps } from "solid-js";
import { expectTypeOf } from "vitest";
import type { elements } from "./elements.ts";

type Tag = (typeof elements)[number];
type NativeProps = { [K in Tag]: ComponentProps<K> };
type HelperProps = {
  [K in Tag]: Pick<ComponentProps<(typeof Role)[K]>, keyof NativeProps[K]>;
};

expectTypeOf<HelperProps>().toExtend<NativeProps>();
expectTypeOf<NativeProps>().toExtend<HelperProps>();
expectTypeOf<keyof typeof Role>().extract<Tag>().toEqualTypeOf<Tag>();
