import clsx, { type ClassValue } from "clsx";

export type { ClassValue };

type Variants = Record<string, Record<any, ClassValue>>;

type AnyVariants = Record<string, Record<any, unknown>>;

type StringToBoolean<T> = T extends "true" | "false" ? boolean : T;

type DefaultVariants<V extends AnyVariants> = {
  [K in keyof V]?: StringToBoolean<keyof V[K]>;
};

type EmptyRecord = Record<never, never>;

// Recursively merges variants from extended CVReturns using tuple inference
type MergeExtendedVariants<T> = T extends [infer First, ...infer Rest]
  ? ExtractVariants<First> & MergeExtendedVariants<Rest>
  : EmptyRecord;

type ExtractVariants<T> =
  T extends CVReturn<infer V, infer E, infer _A>
    ? V & MergeExtendedVariants<E>
    : EmptyRecord;

// Recursively merges aliasVariants from extended CVReturns
type MergeExtendedAliasVariants<T> = T extends [infer First, ...infer Rest]
  ? ExtractAliasVariants<First> & MergeExtendedAliasVariants<Rest>
  : EmptyRecord;

type ExtractAliasVariants<T> =
  T extends CVReturn<infer _V, infer E, infer A>
    ? A & MergeExtendedAliasVariants<E>
    : EmptyRecord;

// Internal type for any alias variants object at runtime
type AnyAliasVariantsRuntime = Record<string, readonly string[]>;

// Get all possible options across all variants for given keys (union)
type AllOptions<V extends AnyVariants, K> = K extends keyof V
  ? keyof V[K]
  : never;

// Check if option O exists in variant K. Distributes over K to check each one.
type OptionExistsInVariant<V extends AnyVariants, K, O> = K extends keyof V
  ? O extends keyof V[K]
    ? true
    : false
  : false;

// Check if option O exists in ALL variants. Returns true only if O exists in
// every variant, false if missing from any.
type OptionExistsInAll<
  V extends AnyVariants,
  K,
  O,
> = false extends OptionExistsInVariant<V, K, O> ? false : true;

// Compute options common to ALL variants for the given keys (intersection).
type CommonOptions<V extends AnyVariants, K> = AllOptions<V, K> extends infer O
  ? O extends string
    ? OptionExistsInAll<V, K, O> extends true
      ? O
      : never
    : never
  : never;

// Extract array element type as a union (without distributing)
type ArrayElementUnion<T> = T extends readonly (infer E)[] ? E : never;

// Check if all target variants have exactly the same options. Returns true only
// if the union of options equals the intersection (all variants identical).
// Uses tuple wrapping to prevent distribution over the union.
type OptionsMatch<V extends AnyVariants, K> = [AllOptions<V, K>] extends [
  CommonOptions<V, K>,
]
  ? [CommonOptions<V, K>] extends [AllOptions<V, K>]
    ? true
    : false
  : false;

// Validates that alias variant targets are all valid variant keys AND have
// matching options. Returns never for invalid targets or mismatched options
// to cause a type error.
type ValidAliasVariants<V extends AnyVariants, A> = {
  [K in keyof A]: A[K] extends readonly (string & keyof V)[]
    ? OptionsMatch<V, ArrayElementUnion<A[K]>> extends true
      ? A[K]
      : A[K] extends [infer First, ...any]
        ? First[]
        : never
    : (keyof V)[];
};

// Extract valid variant keys from an alias targets array (as a union)
type ExtractValidTargets<
  V extends AnyVariants,
  Targets,
> = Targets extends readonly (infer T)[]
  ? T extends keyof V
    ? T
    : never
  : never;

// Props for alias variants. Only generates props for actual keys in A.
// Filters out invalid targets before computing valid values.
type AliasVariantProps<V extends AnyVariants, A> = keyof A extends never
  ? EmptyRecord
  : {
      [K in keyof A]?: A[K] extends readonly string[]
        ? ExtractValidTargets<V, A[K]> extends never
          ? never
          : StringToBoolean<CommonOptions<V, ExtractValidTargets<V, A[K]>>>
        : never;
    };

type AnyCVReturn = CVReturn<AnyVariants, AnyCVReturn[], EmptyRecord>;

interface ClassProps {
  class?: ClassValue;
  className?: ClassValue;
}

type AllVariants<V extends AnyVariants, E extends AnyCVReturn[]> = V &
  MergeExtendedVariants<E>;

// Merge alias variants from child and extended parents. Child aliases override
// parent aliases with the same key. Uses Omit to remove overridden parent keys.
type AllAliasVariants<A, E extends AnyCVReturn[]> = keyof A extends never
  ? MergeExtendedAliasVariants<E>
  : keyof MergeExtendedAliasVariants<E> extends never
    ? A
    : Omit<MergeExtendedAliasVariants<E>, keyof A> & A;

type CVProps<
  V extends AnyVariants,
  E extends AnyCVReturn[],
  A = EmptyRecord,
> = DefaultVariants<AllVariants<V, E>> &
  AliasVariantProps<AllVariants<V, E>, AllAliasVariants<A, E>> &
  ClassProps;

type VariantKeys<
  V extends AnyVariants,
  E extends AnyCVReturn[],
  A = EmptyRecord,
> =
  | keyof V
  | keyof MergeExtendedVariants<E>
  | (A extends EmptyRecord ? never : keyof AllAliasVariants<A, E>)
  | "class";

type SplitResult<
  P,
  V extends AnyVariants,
  E extends AnyCVReturn[],
  A = EmptyRecord,
> = P extends object
  ? [
      Pick<P, Extract<keyof P, VariantKeys<V, E, A>>>,
      Omit<P, VariantKeys<V, E, A>>,
    ]
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
  A = EmptyRecord,
> {
  /**
   * Computes the final class string based on the provided variant props.
   */
  (props?: CVProps<V, E, A>): string;
  /**
   * Separates variant props (including `class` and `className`) from the rest
   * of the props object.
   */
  splitProps: <P extends CVProps<V, E, A>>(props: P) => SplitResult<P, V, E, A>;
  /**
   * The default values for each variant, including alias variants.
   */
  defaultVariants: DefaultVariants<AllVariants<V, E>> &
    AliasVariantProps<AllVariants<V, E>, AllAliasVariants<A, E>>;
  /**
   * Array of all variant prop keys, including alias variants, `class` and
   * `className`.
   */
  variantProps: readonly VariantKeys<V, E, A>[];
  /**
   * The alias variant mappings from alias name to target variant keys.
   */
  aliasVariants: AllAliasVariants<A, E>;
}

// Compound variant type that also supports alias variant keys
type CompoundVariantWithAlias<V extends AnyVariants, A> = {
  [K in keyof V]?: StringToBoolean<keyof V[K]> | StringToBoolean<keyof V[K]>[];
} & (keyof A extends never
  ? EmptyRecord
  : {
      [K in keyof A]?: A[K] extends readonly string[]
        ? ExtractValidTargets<V, A[K]> extends never
          ? never
          :
              | StringToBoolean<CommonOptions<V, ExtractValidTargets<V, A[K]>>>
              | StringToBoolean<
                  CommonOptions<V, ExtractValidTargets<V, A[K]>>
                >[]
        : never;
    }) &
  ClassProps;

/**
 * Configuration object for creating a class variance utility with `cv`.
 */
export interface CVConfig<
  V extends Variants,
  E extends AnyCVReturn[],
  A extends object = EmptyRecord,
> {
  /**
   * Other `cv` instances to extend from, inheriting their base classes and
   * variants.
   */
  extend?: E;
  /**
   * The base class that is always applied.
   */
  class?: ClassValue;
  /**
   * A map of variant names to their possible values and corresponding classes.
   */
  variants?: V & Partial<MergeExtendedVariants<E>>;
  /**
   * A map of alias names to arrays of target variant keys. When an alias is
   * provided, its value is passed to all target variants unless they are
   * explicitly set.
   */
  aliasVariants?: ValidAliasVariants<AllVariants<V, E>, A>;
  /**
   * Default values for variants when not explicitly provided in props.
   */
  defaultVariants?: DefaultVariants<AllVariants<V, E>> &
    AliasVariantProps<AllVariants<V, E>, AllAliasVariants<A, E>>;
  /**
   * Classes to apply when multiple variant conditions are met simultaneously.
   */
  compoundVariants?: CompoundVariantWithAlias<
    AllVariants<V, E>,
    AllAliasVariants<A, E>
  >[];
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
    const A extends object = EmptyRecord,
  >(
    cvConfig: CVConfig<V, E, A>,
  ): CVReturn<V, E, A> => {
    // Collect aliasVariants from extended parents, then merge child's aliases
    const mergedAliasVariants: AnyAliasVariantsRuntime = {};
    if (cvConfig.extend) {
      for (const extended of cvConfig.extend) {
        Object.assign(mergedAliasVariants, extended.aliasVariants);
      }
    }
    Object.assign(mergedAliasVariants, cvConfig.aliasVariants ?? {});

    const callable = (props: CVProps<V, E, A> = {}) => {
      const mergedProps: Record<string, unknown> = {
        ...cvConfig.defaultVariants,
        ...props,
      };

      // Expand alias variants into their targets. Only set target if not
      // explicitly provided in original props or defaults.
      for (const [aliasName, targets] of Object.entries(mergedAliasVariants)) {
        const aliasValue = mergedProps[aliasName];
        if (aliasValue == null) continue;
        for (const target of targets) {
          // Explicit props take precedence over alias expansion
          const propsRecord = props as Record<string, unknown>;
          if (propsRecord[target] != null) continue;
          // Don't override if already set by defaults
          if (mergedProps[target] != null) continue;
          mergedProps[target] = aliasValue;
        }
      }

      const classes: ClassValue[] = [];

      if (cvConfig.extend) {
        // Pass merged props (child defaults + user props + expanded aliases)
        // to extended cv instances. Exclude class/className to avoid
        // duplicating user-provided classes. Also exclude alias variant keys
        // so parents don't re-expand aliases with their own mappings.
        const extendedProps: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(mergedProps)) {
          if (key === "class") continue;
          if (key === "className") continue;
          // Skip alias variant keys - only pass target variant values
          if (key in mergedAliasVariants) continue;
          extendedProps[key] = value;
        }
        for (const extended of cvConfig.extend) {
          // Extended cv instances are typed as AnyCVReturn which accepts a
          // generic props object. The variant keys are compatible at runtime.
          type ExtendedCVProps = CVProps<
            AnyVariants,
            AnyCVReturn[],
            EmptyRecord
          >;
          classes.push(extended(extendedProps as ExtendedCVProps));
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

    // Collect variant keys from extended CVs, then child variants, then alias
    // variants, then class/className at the end
    const variantPropKeys = new Set<string>();
    if (cvConfig.extend) {
      for (const extended of cvConfig.extend) {
        for (const key of extended.variantProps) {
          if (key !== "class" && key !== "className") {
            variantPropKeys.add(key);
          }
        }
      }
    }
    for (const key of Object.keys(cvConfig.variants ?? {})) {
      variantPropKeys.add(key);
    }
    // Include alias variant keys in variantProps
    for (const key of Object.keys(mergedAliasVariants)) {
      variantPropKeys.add(key);
    }
    variantPropKeys.add("class");
    variantPropKeys.add("className");

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
      return [variantPropsResult, rest] as SplitResult<P, V, E, A>;
    };

    // Merge defaultVariants from extended CVs with child's defaultVariants
    const mergedDefaultVariants: Record<string, unknown> = {};
    if (cvConfig.extend) {
      for (const extended of cvConfig.extend) {
        Object.assign(mergedDefaultVariants, extended.defaultVariants);
      }
    }
    Object.assign(mergedDefaultVariants, cvConfig.defaultVariants);
    callable.defaultVariants = mergedDefaultVariants;

    callable.variantProps = [...variantPropKeys] as VariantKeys<V, E, A>[];

    callable.aliasVariants = mergedAliasVariants as AllAliasVariants<A, E>;

    return callable as CVReturn<V, E, A>;
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
