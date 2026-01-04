import clsx, { type ClassValue } from "clsx";

export type { ClassValue };

type Variants = Record<string, Record<string, ClassValue>>;

type AnyVariants = Record<string, Record<string, unknown>>;

type StringToBoolean<T> = T extends "true" | "false" ? boolean : T;

type DefaultVariants<V extends AnyVariants> = {
  [K in keyof V]?: StringToBoolean<keyof V[K]>;
};

type CompoundVariant<V extends AnyVariants> = {
  [K in keyof V]?: StringToBoolean<keyof V[K]> | StringToBoolean<keyof V[K]>[];
} & ClassProps;

type EmptyRecord = Record<never, never>;

// Recursively merges variants from extended CVReturns using tuple inference
type MergeExtendedVariants<T> = T extends [infer First, ...infer Rest]
  ? ExtractVariants<First> & MergeExtendedVariants<Rest>
  : EmptyRecord;

type ExtractVariants<T> =
  T extends CVReturn<infer V, infer E>
    ? V & MergeExtendedVariants<E>
    : EmptyRecord;

type AnyCVReturn = CVReturn<AnyVariants, AnyCVReturn[]>;

interface ClassProps {
  class?: ClassValue;
  className?: ClassValue;
}

type CVProps<
  V extends AnyVariants,
  E extends AnyCVReturn[],
> = DefaultVariants<V> & DefaultVariants<MergeExtendedVariants<E>> & ClassProps;

type VariantKeys<V extends AnyVariants, E extends AnyCVReturn[]> =
  | keyof V
  | keyof MergeExtendedVariants<E>
  | "class";

type SplitResult<
  P,
  V extends AnyVariants,
  E extends AnyCVReturn[],
> = P extends object
  ? [Pick<P, Extract<keyof P, VariantKeys<V, E>>>, Omit<P, VariantKeys<V, E>>]
  : [EmptyRecord, P];

/**
 * Extracts the variant props type from a cv return type.
 * @example
 * const button = cv({
 *   class: "btn",
 *   variants: { size: { sm: "...", lg: "..." } }
 * });
 * type ButtonProps = VariantProps<typeof button>;
 * // { size?: "sm" | "lg" }
 */
export type VariantProps<T extends CVReturn> = T["defaultVariants"];

/**
 * The return type of the `cv` function. A callable that computes class strings
 * based on variant props, with utility methods for splitting props and
 * accessing variant metadata.
 */
export interface CVReturn<
  V extends AnyVariants = AnyVariants,
  E extends AnyCVReturn[] = AnyCVReturn[],
> {
  /**
   * Computes the final class string based on the provided variant props.
   */
  (props?: CVProps<V, E>): string;
  /**
   * Separates variant props (including `class` and `className`) from the rest
   * of the props object.
   */
  splitProps: <P extends CVProps<V, E>>(props: P) => SplitResult<P, V, E>;
  /**
   * The default values for each variant.
   */
  defaultVariants: DefaultVariants<V> &
    DefaultVariants<MergeExtendedVariants<E>>;
  /**
   * Array of all variant prop keys, including `class` and `className`.
   */
  variantProps: readonly VariantKeys<V, E>[];
}

/**
 * Configuration object for creating a class variance utility with `cv`.
 */
export interface CVConfig<V extends Variants, E extends AnyCVReturn[]> {
  /**
   * Other `cv` instances to extend from, inheriting their base classes and
   * variants.
   */
  extend?: E;
  /**
   * The base class that is always applied.
   */
  class: ClassValue;
  /**
   * A map of variant names to their possible values and corresponding classes.
   */
  variants?: V & Partial<MergeExtendedVariants<E>>;
  /**
   * Default values for variants when not explicitly provided in props.
   */
  defaultVariants?: DefaultVariants<V> &
    DefaultVariants<MergeExtendedVariants<E>>;
  /**
   * Classes to apply when multiple variant conditions are met simultaneously.
   */
  compoundVariants?: CompoundVariant<V & MergeExtendedVariants<E>>[];
}

/**
 * Configuration object for `createCV` to customize the behavior of `cv` and
 * `cx`.
 */
export interface CreateCVConfig {
  /**
   * A function to transform the final class string. Useful for applying
   * utilities like `tailwind-merge` to deduplicate or merge Tailwind classes.
   */
  transform?: (className: string) => string;
}

/**
 * Creates customized cv and cx functions with an optional transform.
 * @example
 * const { cv, cx } = createCV({ transform: twMerge });
 */
export function createCV(config: CreateCVConfig = {}) {
  const { transform = (cls: string) => cls } = config;

  const customCx = (...values: ClassValue[]) => transform(clsx(...values));

  /**
   * Creates a class variance utility that computes class strings based on
   * variants. Supports extending from other cv instances to compose styles.
   */
  const customCv = <
    V extends Variants = EmptyRecord,
    const E extends AnyCVReturn[] = [],
  >(
    cvConfig: CVConfig<V, E>,
  ): CVReturn<V, E> => {
    const callable = (props: Record<string, unknown> = {}) => {
      const mergedProps = { ...cvConfig.defaultVariants, ...props };
      const classes: ClassValue[] = [];

      if (cvConfig.extend) {
        for (const extended of cvConfig.extend) {
          classes.push(extended());
        }
      }

      if (cvConfig.class) {
        classes.push(cvConfig.class);
      }

      if (cvConfig.variants) {
        for (const [variantName, variantOptions] of Object.entries(
          cvConfig.variants,
        )) {
          const propValue = mergedProps[variantName];
          if (propValue == null) continue;
          const optionKey = String(propValue);
          const optionValue = variantOptions[optionKey];
          if (optionValue != null) {
            classes.push(optionValue as ClassValue);
          }
        }
      }

      // Apply compound variants when all conditions match
      if (cvConfig.compoundVariants) {
        for (const compound of cvConfig.compoundVariants) {
          const { class: cls, className, ...conditions } = compound;
          const matches = Object.entries(conditions).every(([key, value]) => {
            const propValue = mergedProps[key];
            if (Array.isArray(value)) {
              return value.includes(propValue);
            }
            return propValue === value;
          });
          if (matches) {
            if (cls != null) {
              classes.push(cls);
            }
            if (className != null) {
              classes.push(className);
            }
          }
        }
      }

      // Append user-provided class/className at the end
      const userClass = mergedProps.class as ClassValue | undefined;
      const userClassName = mergedProps.className as ClassValue | undefined;
      if (userClass != null) {
        classes.push(userClass);
      }
      if (userClassName != null) {
        classes.push(userClassName);
      }

      return customCx(...classes);
    };

    const variantPropKeys = new Set([
      ...Object.keys(cvConfig.variants ?? {}),
      "class",
      "className",
    ]);

    callable.splitProps = <P extends Record<string, unknown>>(props: P) => {
      const variantPropsResult: Record<string, unknown> = {};
      const rest: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(props)) {
        if (variantPropKeys.has(key)) {
          variantPropsResult[key] = value;
        } else {
          rest[key] = value;
        }
      }
      return [variantPropsResult, rest] as SplitResult<P, V, E>;
    };

    callable.defaultVariants = cvConfig.defaultVariants ?? {};
    callable.variantProps = [...variantPropKeys] as VariantKeys<V, E>[];

    return callable as CVReturn<V, E>;
  };

  return { cv: customCv, cx: customCx };
}

// Default cv and cx without transformation
const { cv: defaultCv, cx: defaultCx } = createCV();

/**
 * Creates a class variance utility that computes class strings based on
 * variants. Supports extending from other `cv` instances to compose styles.
 * @example
 * const button = cv({
 *   class: "btn",
 *   variants: { size: { sm: "btn-sm", lg: "btn-lg" } }
 * });
 * button({ size: "sm" }); // "btn btn-sm"
 * button({ size: "lg" }); // "btn btn-lg"
 */
export const cv = defaultCv;

/**
 * Concatenates class names, filtering out falsy values. Supports strings,
 * objects, arrays, and nested combinations.
 * @example
 * cx("foo", "bar", "baz"); // "foo bar baz"
 * cx({ foo: true, bar: false, baz: true }); // "foo baz"
 * cx("foo", { bar: true, baz: false }, null, { "--foobar": "hello" }); // "foo --foobar"
 */
export const cx = defaultCx;
