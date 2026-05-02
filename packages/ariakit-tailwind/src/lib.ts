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
  initial?: PropertyValue;
  defaultValue?: VarDefaultValue;
}

export interface CustomProperty
  extends
    TypeObject<Type["CustomProperty"]>,
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

interface Decl<P extends Property = Property> extends TypeObject<
  Type["Declaration"]
> {
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
  initial,
  ns,
}: CreatePropertyFnOptions = {}) {
  const nsIdent = ns ? getIdent(ns) : undefined;
  const defaultSyntax = syntax;
  const defaultInherits = inherits;
  const defaultInitialValue = initial;
  const createProperty = (
    ident: VarProperty | DashedIdent,
    options: Partial<CustomPropertyOptions> | VarDefaultValue = {},
  ): CustomProperty => {
    const {
      syntax = defaultSyntax,
      inherits = defaultInherits,
      initial = defaultInitialValue,
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
      initial,
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
  return Object.assign(createPropertyFn({ ns }), {
    color: createPropertyFn({ ns, syntax: "<color>" }),
    black: createPropertyFn({ ns, syntax: "<color>", initial: "black" }),
    white: createPropertyFn({ ns, syntax: "<color>", initial: "white" }),
    canvas: createPropertyFn({ ns, syntax: "<color>", initial: "canvas" }),
    angle: createPropertyFn({ ns, syntax: "<angle>" }),
    len: createPropertyFn({ ns, syntax: "<length>" }),
    number: createPropertyFn({ ns, syntax: "<number>" }),
    zero: createPropertyFn({ ns, syntax: "<number>", initial: "0" }),
  });
}

type ContextParity = "even" | "odd";

export interface WithContextParams {
  opposite: (property: VarProperty) => VarProperty;
  provide: (property: VarProperty) => VarProperty;
  inherit: typeof fn.var;
}

interface WithContextReadParams {
  inherit: typeof fn.var;
}

type GetContextChildren = (
  params: WithContextParams,
) => Array<AtRuleChild | undefined>;
type GetContextReadChildren = (
  params: WithContextReadParams,
) => Array<AtRuleChild | undefined>;

interface Context {
  (getContextChildren: GetContextChildren): AtRuleChild[];
  read: (getContextChildren: GetContextReadChildren) => AtRuleChild[];
}

let contextCounter = 0;

/**
 * Emulates an `inherit()` function by routing parent values through alternating
 * context vars selected by style container queries.
 */
export function createContext(reset?: boolean): Context {
  const id = `--_context-${contextCounter++}`;

  const getNextParity = (parity: ContextParity): ContextParity => {
    if (parity === "even" && !reset) return "odd";
    return "even";
  };

  const getParityVar = (
    property: VarProperty | DashedIdent,
    parity: ContextParity,
  ) => {
    return createVar(`${getIdent(property)}-${parity}`);
  };

  const withParityContainers = (
    getChildren: (parity?: ContextParity) => AtRuleChild[],
  ) => {
    if (reset) {
      return getChildren();
    }
    const initialParity = `(${fn.style(id, "even")}) or (not ${fn.style(id)})`;
    return [
      at.container(initialParity, ...getChildren("even")),
      at.container(fn.style(id, "odd"), ...getChildren("odd")),
    ];
  };

  const getContextChildrenForParity = (
    getContextChildren: GetContextChildren,
    parity: ContextParity = "even",
  ) => {
    const nextParity = getNextParity(parity);
    const contextChildren = getContextChildren({
      opposite: (property) =>
        getParityVar(property, parity === "even" ? "odd" : "even"),
      provide: (property) => getParityVar(property, nextParity),
      inherit: (property, ...fallbacks) => {
        const inheritedVar = getParityVar(property, parity);
        return fn.var(inheritedVar, ...fallbacks);
      },
    }).filter((child) => child != null);
    return [set(id, nextParity), ...contextChildren];
  };

  const getContextReadChildrenForParity = (
    getContextChildren: GetContextReadChildren,
    parity: ContextParity = "even",
  ) => {
    return getContextChildren({
      inherit: (property, ...fallbacks) => {
        const inheritedVar = getParityVar(property, parity);
        return fn.var(inheritedVar, ...fallbacks);
      },
    }).filter((child) => child != null);
  };

  return Object.assign(
    (getContextChildren: GetContextChildren) =>
      withParityContainers((parity) =>
        getContextChildrenForParity(getContextChildren, parity),
      ),
    {
      read: (getContextChildren: GetContextReadChildren) =>
        withParityContainers((parity) =>
          getContextReadChildrenForParity(getContextChildren, parity),
        ),
    },
  );
}

export interface Namespace
  extends TypeObject<Type["Namespace"]>, DashedIdentObject {
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

interface ColorOptions {
  l?: Value;
  c?: Value;
  h?: Value;
  a?: Value;
}

function colorFn(name: string) {
  function color(from: string | VarProperty, options: ColorOptions): string;
  function color(options: ColorOptions): string;
  function color(
    fromOrOptions: string | VarProperty | ColorOptions,
    options?: ColorOptions,
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
      return fn.exp`${name}(from ${from} ${l} ${c} ${h}${a != null ? ` / ${fn.exp(a)}` : ""})`;
    }
    return fn.exp`${name}(${l} ${c} ${h}${a != null ? ` / ${fn.exp(a)}` : ""})`;
  }
  return color;
}

const oklch = colorFn("oklch");
const lch = colorFn("lch");

type RoundStrategy = "up" | "down" | "to-zero";

function round(value: Value, interval?: Value): string;
function round(strategy: RoundStrategy, value: Value, interval?: Value): string;
function round(
  strategyOrValue: Value,
  valueOrInterval?: Value,
  interval?: Value,
) {
  return `round(${join([strategyOrValue, valueOrInterval, interval])})`;
}

function cleanCalc(value: string) {
  return value.replaceAll("calc(", "(");
}

function isZeroValue(value: Value | undefined) {
  if (typeof value === "number") {
    return value === 0;
  }
  if (typeof value === "string") {
    return /^-?0(?:\.0+)?(?:[a-z%]+)?$/i.test(value);
  }
  return false;
}

function isOneValue(value: Value | undefined) {
  if (typeof value === "number") {
    return value === 1;
  }
  if (typeof value === "string") {
    return /^1(?:\.0+)?$/i.test(value);
  }
  return false;
}

export const fn = {
  /** Interpolates values into a CSS expression string. */
  exp,
  oklch,
  lch,
  round,
  join,

  calc: (...args: Parameters<typeof exp>) =>
    `calc(${cleanCalc(fn.exp(...args))})`,
  add: (...args: Value[]) => {
    const values = args.filter((value) => !isZeroValue(value));
    if (!values.length) {
      return "0";
    }
    if (values.length === 1) {
      const [value] = values;
      return value == null ? "0" : fn.exp(value);
    }
    return fn.calc(join(values, " + "));
  },
  sub: (...args: Value[]) => {
    const [firstValue, ...restValues] = args;
    if (firstValue == null) {
      return "0";
    }
    const values = restValues.filter((value) => !isZeroValue(value));
    if (!values.length) {
      return fn.exp(firstValue);
    }
    return fn.calc(join([firstValue, ...values], " - "));
  },
  mul: (...args: Value[]) => {
    if (args.some((value) => isZeroValue(value))) {
      return "0";
    }
    const values = args.filter((value) => !isOneValue(value));
    if (!values.length) {
      return "1";
    }
    if (values.length === 1) {
      const [value] = values;
      return value == null ? "1" : fn.exp(value);
    }
    return fn.calc(join(values, " * "));
  },
  div: (...args: Value[]) => {
    const [firstValue, ...restValues] = args;
    if (firstValue == null || isZeroValue(firstValue)) {
      return "0";
    }
    const values = restValues.filter((value) => !isOneValue(value));
    if (!values.length) {
      return fn.exp(firstValue);
    }
    return fn.calc(join([firstValue, ...values], " / "));
  },
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
  toPx: (x: Value) => fn.mul(x, "1px"),

  /** Inverts a normalized value using 1 - x. */
  invert: (x: Value) => fn.sub(1, x),
  /** Scales a value for binary-like thresholding. */
  inflate: (x: Value) => fn.mul(x, 1e6),
  /** Converts a value to 0 or 1. */
  binary: (x: Value) => fn.clamp01(fn.inflate(x)),
  /** Builds a --value() expression. */
  value: (...args: Value[]) => `--value(${join(args)})`,
  /** Builds a --spacing() expression. */
  spacing: (...args: Value[]) => `--spacing(${join(args)})`,
  /** Builds a --modifier() expression. */
  modifier: (...args: Value[]) => `--modifier(${join(args)})`,
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
    return `(${propertyName}${propertyValue != null ? `: ${fn.exp(propertyValue)}` : ""})`;
  },

  /** Builds a style() query condition. */
  style: (property: Property | VarProperty, value?: Value) =>
    `style${fn.query(property, value)}`,

  /** Wraps a value with `!important`. */
  important: (value: Value) => `${exp(value)} !important`,

  /** Builds a color-mix() expression. */
  colorMix: (
    method: Value,
    colorA: Value,
    colorB: Value,
    amount?: Value,
  ): string => {
    if (amount != null) {
      return exp`color-mix(in ${method}, ${colorA}, ${colorB} ${amount})`;
    }
    return exp`color-mix(in ${method}, ${colorA}, ${colorB})`;
  },

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
    return `var(${varName}${resolvedFallbackValue != null ? `, ${fn.exp(resolvedFallbackValue)}` : ""})`;
  },
};
