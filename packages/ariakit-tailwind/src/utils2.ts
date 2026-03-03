import type * as CSS from "csstype";

/**
 * Drops the first N elements from a tuple T and returns the remaining elements.
 */
type Drop<
  T extends readonly unknown[],
  N extends number,
  Acc extends readonly unknown[] = [],
> = Acc["length"] extends N
  ? T
  : T extends readonly [unknown, ...infer Rest]
    ? Drop<Rest, N, readonly [unknown, ...Acc]>
    : readonly []; // N >= T["length"]

/**
 * Strips N leading parameters from function type F and returns the remaining
 * parameters tuple.
 */
type StripLeadingParameters<
  F extends (...args: any[]) => any,
  N extends number = 1,
> = Drop<Parameters<F>, N>;

export type Type = typeof Type;
export const Type = Object.freeze({
  Rule: "rule",
  AtRule: "at-rule",
  CustomVariant: "custom-variant",
  Declaration: "declaration",
  Var: "var",
  CustomProperty: "custom-property",
  Namespace: "namespace",
});

export const AtRuleName = Object.freeze({
  Container: "container",
  CustomVariant: "custom-variant",
  Apply: "apply",
  Variant: "variant",
  Layer: "layer",
  Media: "media",
  Supports: "supports",
  Utility: "utility",
  Theme: "theme",
});

type DashedIdent = `--${string}`;
type CSSProperties = CSS.Properties<string>;
type CSSProperty = keyof CSSProperties;
type Property = CSSProperty | (string & {});
type PropertyValue = string | number | undefined;
type VarDefaultValue = VarProperty | string | number | undefined;
type VarFallbacks =
  | []
  | [VarDefaultValue]
  | [VarProperty, ...VarProperty[], VarDefaultValue];

export type Value = string | number | VarProperty | Namespace;

interface TypeObject<T extends Type[keyof Type]> {
  type: T;
}

interface IdentObject<T extends string = string> {
  ident: T;
}

interface DashedIdentObject extends IdentObject<DashedIdent> {}

export interface Var extends TypeObject<Type["Var"]>, DashedIdentObject {
  defaultValue: VarDefaultValue;
}

interface CustomPropertyOptions {
  syntax: string;
  inherits: boolean;
  initialValue?: PropertyValue;
  defaultValue?: VarDefaultValue;
}

export interface CustomProperty
  extends TypeObject<Type["CustomProperty"]>,
    DashedIdentObject,
    CustomPropertyOptions {}

export type VarProperty = Var | CustomProperty;

type AtRuleChild = Decl | Rule | AtRule | CustomProperty;

export interface Rule extends TypeObject<Type["Rule"]> {
  selector: string;
  children: AtRuleChild[];
}

export interface AtRule extends TypeObject<Type["AtRule"]> {
  name: string;
  params?: string;
  children: AtRuleChild[];
}

export interface CustomVariant extends TypeObject<Type["CustomVariant"]> {
  name: string;
  children: AtRuleChild[];
}

interface Decl<P extends Property = Property>
  extends TypeObject<Type["Declaration"]> {
  property: P;
  value: P extends CSSProperty ? CSSProperties[P] : PropertyValue;
}

function isObject(arg: unknown): arg is Record<string, unknown> {
  return typeof arg === "object" && arg != null;
}

function isVar(arg: unknown): arg is Var {
  return isObject(arg) && "type" in arg && arg.type === Type.Var;
}

function isCustomProperty(arg: unknown): arg is CustomProperty {
  return isObject(arg) && "type" in arg && arg.type === Type.CustomProperty;
}

function isVarProperty(arg: unknown): arg is VarProperty {
  return isVar(arg) || isCustomProperty(arg);
}

function isNamespace(arg: unknown): arg is Namespace {
  return isObject(arg) && "type" in arg && arg.type === Type.Namespace;
}

function isPropertyValue(arg: unknown): arg is PropertyValue {
  return typeof arg === "string" || typeof arg === "number";
}

function getIdent(
  value: DashedIdent | DashedIdentObject,
): DashedIdentObject["ident"];
function getIdent(
  value: DashedIdentObject,
  ns: Namespace | DashedIdent,
): IdentObject["ident"];
function getIdent(
  value: IdentObject,
  ns?: Namespace | DashedIdent,
): IdentObject["ident"];
function getIdent(
  value: IdentObject | string,
  ns?: Namespace | DashedIdent,
): string;
function getIdent(value: IdentObject | string, ns?: Namespace | DashedIdent) {
  const valueIdent = (() => {
    if (typeof value === "string") return value;
    return value.ident;
  })();
  if (ns == null) return valueIdent;
  const nsIdent = isNamespace(ns) ? ns.ident : ns;
  return valueIdent.replace(new RegExp(`^${nsIdent}-`), "");
}

export function createVar(
  ident: VarProperty["ident"],
  defaultValue?: VarDefaultValue,
): VarProperty {
  return { type: Type.Var, ident, defaultValue };
}

interface CreatePropertyFnOptions extends Partial<CustomPropertyOptions> {
  ns?: DashedIdentObject | DashedIdent;
}

function createPropertyFn(
  options?: Omit<CreatePropertyFnOptions, "ns">,
): (
  ident: VarProperty | DashedIdent,
  options?: Partial<CustomPropertyOptions> | VarDefaultValue,
) => CustomProperty;
function createPropertyFn(
  options: CreatePropertyFnOptions,
): (
  ident: VarProperty | string,
  options?: Partial<CustomPropertyOptions> | VarDefaultValue,
) => CustomProperty;
function createPropertyFn({
  syntax = "*",
  inherits = false,
  initialValue,
  ns,
}: CreatePropertyFnOptions = {}) {
  const nsIdent = ns ? getIdent(ns) : undefined;
  const defaultSyntax = syntax;
  const defaultInherits = inherits;
  const defaultInitialValue = initialValue;
  const createProperty = (
    ident: VarProperty | DashedIdent,
    options: Partial<CustomPropertyOptions> | VarDefaultValue = {},
  ): CustomProperty => {
    const {
      syntax = defaultSyntax,
      inherits = defaultInherits,
      initialValue = defaultInitialValue,
      ...rest
    } = isPropertyValue(options) || isVarProperty(options)
      ? { defaultValue: options }
      : options;
    const identValue = isVarProperty(ident) ? getIdent(ident) : ident;
    return {
      type: Type.CustomProperty,
      ident: identValue,
      syntax,
      inherits,
      initialValue,
      ...rest,
    };
  };
  if (!nsIdent) {
    return createProperty;
  }
  return (
    name: string | VarProperty,
    ...args: StripLeadingParameters<typeof createProperty>
  ) => createProperty(`${nsIdent}-${getIdent(name, nsIdent)}`, ...args);
}

function createPropertyObj(ns?: DashedIdentObject | DashedIdent) {
  const black = "oklch(0 0 0)";
  const white = "oklch(1 0 0)";
  return Object.assign(createPropertyFn({ ns }), {
    color: createPropertyFn({ ns, syntax: "<color>" }),
    black: createPropertyFn({ ns, syntax: "<color>", initialValue: black }),
    white: createPropertyFn({ ns, syntax: "<color>", initialValue: white }),
    canvas: createPropertyFn({ ns, syntax: "<color>", initialValue: "canvas" }),
    angle: createPropertyFn({ ns, syntax: "<angle>" }),
    len: createPropertyFn({ ns, syntax: "<length>" }),
    number: createPropertyFn({ ns, syntax: "<number>" }),
    zero: createPropertyFn({ ns, syntax: "<number>", initialValue: "0" }),
  });
}

type ContextParity = "even" | "odd";

interface WithContextParams {
  opposite: (property: VarProperty) => VarProperty;
  provide: (property: VarProperty) => VarProperty;
  inherit: typeof fn.var;
}

function createContext(id: string) {
  return `--${id}-parity`;
}

/**
 * Emulates an `inherit()` function by routing parent values through alternating
 * context vars selected by style container queries.
 */
export function withContext(
  id: string,
  reset: boolean,
  getContextChildren: (
    params: WithContextParams,
  ) => Array<AtRuleChild | undefined>,
) {
  const parityVar = createVar(`--_ak-${id}-parity`);

  const getNextParity = (parity: ContextParity): ContextParity => {
    if (parity === "even" && !reset) {
      return "odd";
    }
    return "even";
  };

  const getParityVar = (
    property: VarProperty | DashedIdent,
    parity: ContextParity,
  ) => {
    const propertyIdent = isVarProperty(property) ? property.ident : property;
    return createVar(`${propertyIdent}-${parity}`);
  };

  const getChildren = (parity: ContextParity = "even"): AtRuleChild[] => {
    const nextParity = getNextParity(parity);
    const contextChildren = getContextChildren({
      opposite: (property) =>
        getParityVar(property, parity === "even" ? "odd" : "even"),
      provide: (property) => getParityVar(property, nextParity),
      inherit: (property, ...fallbacks) => {
        const inheritedVar = getParityVar(property, parity);
        return fn.var(inheritedVar, ...fallbacks);
      },
    }).filter((child): child is AtRuleChild => child != null);
    return [set(parityVar, nextParity), ...contextChildren];
  };

  if (reset) {
    return getChildren();
  }

  return [
    at.container(fn.style(parityVar, "even"), ...getChildren("even")),
    at.container(fn.style(parityVar, "odd"), ...getChildren("odd")),
    at.container(`not ${fn.style(parityVar)}`, ...getChildren()),
  ];
}

export interface Namespace
  extends TypeObject<Type["Namespace"]>,
    DashedIdentObject {
  name: string;
  ns: typeof createNamespace;
  utility: typeof utility;
  prop: ReturnType<typeof createPropertyObj>;
  var: (
    name: string | VarProperty,
    ...args: StripLeadingParameters<typeof createVar>
  ) => VarProperty;
}

export function createNamespace(nsName: string): Namespace {
  const ident = `--${nsName}` as const;
  return {
    type: Type.Namespace,
    name: nsName,
    ident,
    prop: createPropertyObj(ident),
    ns: (nestedNsName) => createNamespace(`${nsName}-${nestedNsName}`),
    var: (name, ...args) =>
      createVar(`${ident}-${getIdent(name, ident)}`, ...args),
    utility: (name, ...args) => {
      const prefix = name.startsWith("-") ? `-${nsName}` : nsName;
      name = name.replace(new RegExp(`^${prefix}`), "").replace(/^-/, "");
      return utility(`${prefix}-${name}`, ...args);
    },
  };
}

function resolveVarFallbackValue(value: VarDefaultValue) {
  if (isVarProperty(value)) {
    return fn.var(value);
  }
  return value;
}

function decl<P extends CSSProperty>(
  name: P,
  value: CSSProperties[P] | VarProperty,
): Decl<P>;
function decl(
  name: string | VarProperty,
  value?: PropertyValue | VarProperty,
): Decl;
function decl(
  name: Property | VarProperty,
  value: PropertyValue | VarProperty,
): Decl {
  return {
    type: Type.Declaration,
    property: getIdent(name),
    value: isVarProperty(value)
      ? fn.var(value)
      : value === undefined && isVarProperty(name)
        ? resolveVarFallbackValue(name.defaultValue)
        : value,
  };
}

type SetProxy = {
  [P in CSSProperty]-?: (value?: CSSProperties[P] | VarProperty) => Decl<P>;
};

export const set = new Proxy(decl as typeof decl & SetProxy, {
  get(target, property, receiver) {
    if (typeof property !== "string" || property in target) {
      return Reflect.get(target, property, receiver);
    }
    return (value: PropertyValue | VarProperty) => decl(property, value);
  },
});

export function rule(
  selector: Rule["selector"],
  ...children: Rule["children"]
): Rule {
  return { type: Type.Rule, selector, children };
}

export function createVariant(
  name: string,
  ...children: AtRuleChild[]
): CustomVariant {
  return { type: Type.CustomVariant, name, children };
}

function atRule(
  name: AtRule["name"],
  params: AtRule["params"] | AtRuleChild,
  ...children: AtRule["children"]
): AtRule {
  if (typeof params === "string" || params === undefined) {
    return { type: Type.AtRule, name, params, children };
  }
  return { type: Type.AtRule, name, children: [params, ...children] };
}

function variant(
  variant: string | CustomVariant,
  ...children: AtRuleChild[]
): AtRule {
  const name = typeof variant === "string" ? variant : variant.name;
  return atRule(AtRuleName.Variant, name, ...children);
}

function container(query: string, ...children: AtRuleChild[]): AtRule {
  return atRule(AtRuleName.Container, query, ...children);
}

function supportsFn(query: string, ...children: AtRuleChild[]): AtRule {
  return atRule(AtRuleName.Supports, query, ...children);
}

const supports = Object.assign(supportsFn, {
  not: (query: string, ...children: AtRuleChild[]): AtRule =>
    supportsFn(`not ${query}`, ...children),
});

function utility(
  name: string,
  ...children: (AtRuleChild | AtRuleChild[])[]
): AtRule {
  return atRule(AtRuleName.Utility, name, ...children.flat());
}

function apply(...args: Parameters<typeof exp>): AtRule {
  return atRule(AtRuleName.Apply, fn.exp(...args));
}

function theme(
  params: AtRule["params"] | AtRuleChild,
  ...children: AtRuleChild[]
): AtRule {
  return atRule(AtRuleName.Theme, params, ...children);
}

export const at = Object.assign(atRule, {
  container,
  supports,
  utility,
  variant,
  theme,
  apply,
});

function exp(
  strings: Value | TemplateStringsArray,
  ...values: Value[]
): string {
  if (typeof strings === "string") return strings;
  if (typeof strings === "number") return String(strings);
  if (isVarProperty(strings)) return fn.var(strings);
  if (isNamespace(strings)) return `${strings.ident}-*`;
  return strings.reduce((result, stringPart, i) => {
    const value = values[i];
    if (value == null) {
      return result + stringPart;
    }
    return result + stringPart + fn.exp(value);
  }, "");
}

function join(values: (Value | undefined)[], separator = ", ") {
  return values
    .filter((value) => value != null)
    .map((value) => fn.exp(value))
    .join(separator);
}

interface OklchOptions {
  l?: Value;
  c?: Value;
  h?: Value;
  a?: Value;
}

function oklch(from: string | VarProperty, options: OklchOptions): string;
function oklch(options: OklchOptions): string;
function oklch(
  fromOrOptions: string | VarProperty | OklchOptions,
  options?: OklchOptions,
) {
  const hasFrom =
    typeof fromOrOptions === "string" || isVarProperty(fromOrOptions);
  const from = hasFrom ? fromOrOptions : undefined;
  const resolvedOptions = hasFrom ? options : fromOrOptions;
  const {
    l = from ? "l" : 0,
    c = from ? "c" : 0,
    h = from ? "h" : 0,
    a,
  } = resolvedOptions ?? {};
  if (from != null) {
    return fn.exp`oklch(from ${from} ${l} ${c} ${h}${a != null ? ` / ${a}` : ""})`;
  }
  return fn.exp`oklch(${l} ${c} ${h}${a != null ? ` / ${a}` : ""})`;
}

type RoundStrategy = "up" | "down" | "to-zero";

function round(value: Value, interval?: Value): string;
function round(strategy: RoundStrategy, value: Value, interval?: Value): string;
function round(
  strategyOrValue: Value | RoundStrategy,
  valueOrInterval?: Value,
  interval?: Value,
) {
  return `round(${join([strategyOrValue, valueOrInterval, interval])})`;
}

function cleanCalc(value: string) {
  return value.replaceAll("calc(", "(");
}

export const fn = {
  /** Interpolates values into a CSS expression string. */
  exp,
  oklch,
  round,

  calc: (...args: Parameters<typeof exp>) =>
    `calc(${cleanCalc(fn.exp(...args))})`,
  add: (...args: Value[]) => fn.calc(join(args, " + ")),
  sub: (...args: Value[]) => fn.calc(join(args, " - ")),
  mul: (...args: Value[]) => fn.calc(join(args, " * ")),
  div: (...args: Value[]) => fn.calc(join(args, " / ")),
  min: (a: Value, b: Value) => cleanCalc(fn.exp`min(${a}, ${b})`),
  max: (a: Value, b: Value) => cleanCalc(fn.exp`max(${a}, ${b})`),
  mod: (a: Value, b: Value) => cleanCalc(fn.exp`mod(${a}, ${b})`),
  abs: (x: Value) => fn.max(x, fn.neg(x)),
  neg: (x: Value) => fn.mul(x, "-1"),
  sign: (x: Value) => fn.clamp(-1, fn.inflate(x), 1),
  add1: (x: Value) => fn.add(x, 1),
  sub1: (x: Value) => fn.sub(x, 1),
  half: (x: Value) => fn.div(x, 2),
  double: (x: Value) => fn.mul(x, 2),
  toPercent: (x: Value) => fn.mul(x, "1%"),

  /** Inverts a normalized value using 1 - x. */
  invert: (x: Value) => fn.sub(1, x),
  /** Scales a value for binary-like thresholding. */
  inflate: (x: Value) => fn.mul(x, 1e6),
  /** Converts a value to 0 or 1. */
  binary: (x: Value) => fn.clamp01(fn.inflate(x)),
  /** Builds a --value() expression. */
  value: (...args: Value[]) => `--value(${join(args)})`,
  /** Clamps an expression to a minimum of 0. */
  relu: (...args: Parameters<typeof exp>) => fn.max(0, fn.exp(...args)),

  /** Clamps x between min and max. */
  clamp: (min: Value, x: Value, max: Value) =>
    cleanCalc(fn.exp`clamp(${min}, ${x}, ${max})`),

  /** Clamps a value to the [0, 1] range. */
  clamp01: (x: Value) => fn.clamp(0, x, 1),

  /** Builds a query condition for a property and optional value. */
  query: (property: Property | VarProperty, value?: Value) => {
    const propertyName = getIdent(property);
    const propertyValue = isVarProperty(value) ? fn.var(value) : value;
    return `(${propertyName}${propertyValue != null ? `: ${propertyValue}` : ""})`;
  },

  /** Builds a style() query condition. */
  style: (property: Property | VarProperty, value?: Value) =>
    `style${fn.query(property, value)}`,

  /** Builds a var() reference with optional nested fallbacks. */
  var: (
    varObject: VarProperty | DashedIdent,
    ...fallbacks: VarFallbacks
  ): string => {
    const varName = getIdent(varObject);
    const defaultFallback = isVarProperty(varObject)
      ? varObject.defaultValue
      : undefined;
    const [fallbackValue, ...nestedFallbacks] = fallbacks.length
      ? fallbacks
      : [defaultFallback];
    let resolvedFallbackValue: VarDefaultValue;
    if (fallbackValue !== undefined) {
      if (nestedFallbacks.length && isVarProperty(fallbackValue)) {
        resolvedFallbackValue = fn.var(
          fallbackValue,
          ...(nestedFallbacks as VarFallbacks),
        );
      } else {
        resolvedFallbackValue = resolveVarFallbackValue(fallbackValue);
      }
    }
    return `var(${varName}${resolvedFallbackValue != null ? `, ${resolvedFallbackValue}` : ""})`;
  },
};
