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

/**
 * Extracts the variant props type from a cv return type.
 * @example
 * const button = cv({ class: "btn", variants: { size: { sm: "...", lg: "..." } } });
 * type ButtonProps = VariantProps<typeof button>;
 * // { size?: "sm" | "lg" }
 */
export type VariantProps<T extends CVReturn> = T["defaultVariants"];

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

export interface CVReturn<
  V extends AnyVariants = AnyVariants,
  E extends AnyCVReturn[] = AnyCVReturn[],
> {
  (props?: CVProps<V, E>): string;
  splitProps: <P extends CVProps<V, E>>(props: P) => SplitResult<P, V, E>;
  defaultVariants: DefaultVariants<V> &
    DefaultVariants<MergeExtendedVariants<E>>;
  variantProps: readonly VariantKeys<V, E>[];
}

export interface CVConfig<V extends Variants, E extends AnyCVReturn[]> {
  extend?: E;
  class: ClassValue;
  variants?: V & Partial<MergeExtendedVariants<E>>;
  defaultVariants?: DefaultVariants<V> &
    DefaultVariants<MergeExtendedVariants<E>>;
  compoundVariants?: CompoundVariant<V & MergeExtendedVariants<E>>[];
}

interface AnyCompoundVariant {
  class?: ClassValue;
  className?: ClassValue;
  [key: string]: unknown;
}

interface InternalConfig {
  baseClass?: ClassValue;
  variants?: AnyVariants;
  defaultVariants?: Record<string, unknown>;
  compoundVariants?: AnyCompoundVariant[];
  extend?: AnyCVReturn[];
}

interface CreateCVConfig {
  /** Transform the final class string (e.g., apply tailwind-merge) */
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
   * Computes the final class string by merging extended classes, the base
   * class, and variant-specific classes based on the provided props.
   */
  const computeResult = (
    internalConfig: InternalConfig,
    props: Record<string, unknown>,
  ): string => {
    const classes: ClassValue[] = [];

    if (internalConfig.extend) {
      for (const extended of internalConfig.extend) {
        classes.push(extended());
      }
    }

    if (internalConfig.baseClass) {
      classes.push(internalConfig.baseClass);
    }

    if (internalConfig.variants) {
      for (const [variantName, variantOptions] of Object.entries(
        internalConfig.variants,
      )) {
        const propValue = props[variantName];
        if (propValue == null) continue;
        const optionKey = String(propValue);
        const optionValue = variantOptions[optionKey];
        if (optionValue != null) {
          classes.push(optionValue as ClassValue);
        }
      }
    }

    // Apply compound variants when all conditions match
    if (internalConfig.compoundVariants) {
      for (const compound of internalConfig.compoundVariants) {
        const { class: cls, className, ...conditions } = compound;
        const matches = Object.entries(conditions).every(([key, value]) => {
          const propValue = props[key];
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
    const userClass = props.class as ClassValue | undefined;
    const userClassName = props.className as ClassValue | undefined;
    if (userClass != null) {
      classes.push(userClass);
    }
    if (userClassName != null) {
      classes.push(userClassName);
    }

    return customCx(...classes);
  };

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
    const internalConfig: InternalConfig = {
      baseClass: cvConfig.class,
      variants: cvConfig.variants,
      defaultVariants: cvConfig.defaultVariants,
      compoundVariants: cvConfig.compoundVariants,
      extend: cvConfig.extend,
    };

    const callable = (props: Record<string, unknown> = {}) => {
      const mergedProps = { ...internalConfig.defaultVariants, ...props };
      return computeResult(internalConfig, mergedProps);
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

    callable.defaultVariants = internalConfig.defaultVariants ?? {};
    callable.variantProps = [...variantPropKeys] as VariantKeys<V, E>[];

    return callable as CVReturn<V, E>;
  };

  return { cv: customCv, cx: customCx };
}

// Default cv and cx without transformation
const { cv: defaultCv, cx: defaultCx } = createCV();

/**
 * Creates a class variance utility that computes class strings based on
 * variants. Supports extending from other cv instances to compose styles.
 */
export const cv = defaultCv;

/**
 * Concatenates class names, filtering out falsy values. Supports strings,
 * objects, arrays, and nested combinations.
 */
export const cx = defaultCx;
