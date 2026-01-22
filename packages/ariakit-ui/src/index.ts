import type {
  ClassValue,
  CVComponent,
  StyleClassValue,
  VariantProps,
} from "clava";

export type Variant<
  T extends CVComponent<any, any, any, any>,
  K extends keyof VariantProps<T>,
> = Record<VariantProps<T>[K] & string, ClassValue | StyleClassValue>;

export default {};
