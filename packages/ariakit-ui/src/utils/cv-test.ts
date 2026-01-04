import type { VariantProps } from "./cv.ts";
import { createCV, cv, cx } from "./cv.ts";

test("cv returns base class when no variants are provided", () => {
  const style = cv({ class: "flex items-center" });
  expect(style()).toBe("flex items-center");
});

test("cv returns empty string when class is null", () => {
  const style = cv({ class: null });
  expect(style()).toBe("");
});

test("cv flattens nested class arrays", () => {
  const style = cv({ class: ["flex", ["items-center", ["gap-2"]]] });
  expect(style()).toBe("flex items-center gap-2");
});

test("cv filters out null values from class arrays", () => {
  const style = cv({ class: ["flex", null, "items-center", null] });
  expect(style()).toBe("flex items-center");
});

test("cv applies variant class based on prop value", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  expect(style({ size: "small" })).toBe("base text-sm");
  expect(style({ size: "large" })).toBe("base text-lg");
});

test("cv applies multiple variant classes", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
      color: {
        primary: "text-blue",
        secondary: "text-gray",
      },
    },
  });
  expect(style({ size: "small", color: "primary" })).toBe(
    "base text-sm text-blue",
  );
  expect(style({ size: "large", color: "secondary" })).toBe(
    "base text-lg text-gray",
  );
});

test("cv applies default variants when no props provided", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
    defaultVariants: {
      size: "small",
    },
  });
  expect(style()).toBe("base text-sm");
});

test("cv overrides default variants with provided props", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
    defaultVariants: {
      size: "small",
    },
  });
  expect(style({ size: "large" })).toBe("base text-lg");
});

test("cv handles boolean variants with true/false keys", () => {
  const style = cv({
    class: "base",
    variants: {
      disabled: {
        true: "opacity-50",
        false: "opacity-100",
      },
    },
  });
  expect(style({ disabled: true })).toBe("base opacity-50");
  expect(style({ disabled: false })).toBe("base opacity-100");
});

test("cv handles boolean default variants", () => {
  const style = cv({
    class: "base",
    variants: {
      active: {
        true: "bg-blue",
        false: "bg-gray",
      },
    },
    defaultVariants: {
      active: true,
    },
  });
  expect(style()).toBe("base bg-blue");
  expect(style({ active: false })).toBe("base bg-gray");
});

test("cv ignores undefined variant prop values", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  expect(style({ size: undefined })).toBe("base");
});

test("cv ignores null variant prop values", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  // @ts-expect-error - Testing null value behavior
  expect(style({ size: null })).toBe("base");
});

test("cv ignores variant props not matching any option", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  // @ts-expect-error - Testing unknown variant value
  expect(style({ size: "medium" })).toBe("base");
});

test("cv extends from single parent", () => {
  const parent = cv({
    class: "parent-base",
    variants: {
      foo: {
        a: "foo-a",
        b: "foo-b",
      },
    },
    defaultVariants: {
      foo: "a",
    },
  });
  const child = cv({
    extend: [parent],
    class: "child-base",
  });
  expect(child()).toBe("parent-base foo-a child-base");
});

test("cv extends from multiple parents", () => {
  const first = cv({
    class: "first-base",
  });
  const second = cv({
    class: "second-base",
  });
  const child = cv({
    extend: [first, second],
    class: "child-base",
  });
  expect(child()).toBe("first-base second-base child-base");
});

test("cv child can define same variant key as parent", () => {
  const parent = cv({
    class: "parent",
    variants: {
      bar: {
        x: "bar-x",
        y: "bar-y",
      },
    },
    defaultVariants: {
      bar: "x",
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
    variants: {
      bar: {
        x: "child-bar-x",
        y: "child-bar-y",
      },
    },
  });
  // Both parent and child apply the variant prop
  expect(child()).toBe("parent bar-x child");
  expect(child({ bar: "y" })).toBe("parent bar-y child child-bar-y");
});

test("cv child can add new variants", () => {
  const parent = cv({
    class: "parent",
    variants: {
      a: {
        one: "a-one",
        two: "a-two",
      },
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
    variants: {
      b: {
        one: "b-one",
        two: "b-two",
      },
    },
  });
  // Parent variants use parent defaults, child props only affect child variants
  expect(child({ b: "two" })).toBe("parent child b-two");
});

test("cv defaultVariants exposes default variant values", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
      color: {
        primary: "text-blue",
        secondary: "text-gray",
      },
    },
    defaultVariants: {
      size: "small",
      color: "primary",
    },
  });
  expect(style.defaultVariants).toEqual({
    size: "small",
    color: "primary",
  });
});

test("cv defaultVariants is empty object when no defaults provided", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  expect(style.defaultVariants).toEqual({});
});

test("cv handles variant values that are arrays", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: ["text-sm", "leading-tight"],
        large: ["text-lg", "leading-relaxed"],
      },
    },
  });
  expect(style({ size: "small" })).toBe("base text-sm leading-tight");
  expect(style({ size: "large" })).toBe("base text-lg leading-relaxed");
});

test("cv handles variant values with null in arrays", () => {
  const style = cv({
    class: "base",
    variants: {
      foo: {
        bar: ["class-a", null, "class-b"],
      },
    },
  });
  expect(style({ foo: "bar" })).toBe("base class-a class-b");
});

test("cv extends inherit parent default variants", () => {
  const parent = cv({
    class: "parent",
    variants: {
      c: {
        red: "color-red",
        blue: "color-blue",
      },
    },
    defaultVariants: {
      c: "red",
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
  });
  // Parent defaults should apply in extended call
  expect(child()).toBe("parent color-red child");
});

test("cv extended receives passed variant props", () => {
  const parent = cv({
    class: "parent",
    variants: {
      size: {
        small: "size-small",
        large: "size-large",
      },
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
  });
  // Parent should apply the passed variant prop
  expect(child({ size: "small" })).toBe("parent size-small child");
  expect(child({ size: "large" })).toBe("parent size-large child");
});

test("cv extended with compound variants receives props", () => {
  const parent = cv({
    class: "parent",
    variants: {
      intent: {
        primary: "bg-blue",
        secondary: "bg-gray",
      },
      size: {
        small: "text-sm",
        medium: "text-base",
      },
    },
    compoundVariants: [
      {
        intent: "primary",
        size: "medium",
        class: "parent-compound",
      },
    ],
  });
  const child = cv({
    extend: [parent],
    class: "child",
  });
  // Parent compound variant should apply when conditions match
  expect(child({ intent: "primary", size: "medium" })).toBe(
    "parent bg-blue text-base parent-compound child",
  );
  expect(child({ intent: "primary", size: "small" })).toBe(
    "parent bg-blue text-sm child",
  );
});

test("cv extended does not duplicate class/className", () => {
  const parent = cv({
    class: "parent",
    variants: {
      size: {
        small: "size-small",
      },
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
  });
  // User's class/className should only appear once at the end
  expect(child({ size: "small", class: "user-class" })).toBe(
    "parent size-small child user-class",
  );
  expect(child({ size: "small", className: "user-class" })).toBe(
    "parent size-small child user-class",
  );
});

test("cv child defaultVariants override parent defaultVariants", () => {
  const parent = cv({
    class: "parent",
    variants: {
      size: {
        small: "size-small",
        large: "size-large",
      },
    },
    defaultVariants: {
      size: "small",
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
    defaultVariants: {
      size: "large",
    },
  });
  // Child's default should override parent's default
  expect(child()).toBe("parent size-large child");
  // Explicit prop should still work
  expect(child({ size: "small" })).toBe("parent size-small child");
});

test("type: rejects invalid defaultVariants keys", () => {
  cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
    defaultVariants: {
      // @ts-expect-error - "color" is not a defined variant
      color: "red",
    },
  });
});

test("type: rejects invalid defaultVariants values", () => {
  cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
    defaultVariants: {
      // @ts-expect-error - "medium" is not a valid size option
      size: "medium",
    },
  });
});

test("type: rejects unknown props on defaultVariants", () => {
  const style = cv({
    class: "base",
    variants: {
      foo: {
        a: "foo-a",
        b: "foo-b",
      },
    },
    defaultVariants: {
      foo: "a",
    },
  });
  style.defaultVariants.foo;
  // @ts-expect-error - "bar" is not a defined variant
  style.defaultVariants.bar;
});

test("type: extended cv inherits parent variant types in props", () => {
  const parent = cv({
    class: "parent",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
    variants: {
      color: {
        red: "text-red",
        blue: "text-blue",
      },
    },
  });
  // Valid: parent variant key accessible on child
  child({ size: "small" });
  // Valid: child variant key
  child({ color: "red" });
  // @ts-expect-error - "medium" is not a valid size option
  child({ size: "medium" });
  // @ts-expect-error - "green" is not a valid color option
  child({ color: "green" });
});

test("type: extended cv inherits parent variant types in defaultVariants", () => {
  const parent = cv({
    class: "parent",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
    defaultVariants: {
      size: "small",
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
  });
  // Valid: parent's defaultVariants should be accessible
  child.defaultVariants.size;
  // @ts-expect-error - "unknown" is not a defined variant
  child.defaultVariants.unknown;
});

test("cv appends class prop to the result", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  expect(style({ size: "small", class: "custom-class" })).toBe(
    "base text-sm custom-class",
  );
});

test("cv appends className prop to the result", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  expect(style({ size: "small", className: "custom-class" })).toBe(
    "base text-sm custom-class",
  );
});

test("cv appends both class and className props", () => {
  const style = cv({
    class: "base",
  });
  expect(style({ class: "first", className: "second" })).toBe(
    "base first second",
  );
});

test("cv handles array values for class prop", () => {
  const style = cv({
    class: "base",
  });
  expect(style({ class: ["custom-a", "custom-b"] })).toBe(
    "base custom-a custom-b",
  );
});

test("cv handles null class prop", () => {
  const style = cv({
    class: "base",
  });
  expect(style({ class: null })).toBe("base");
});

test("cv variantProps contains all variant keys plus class and className", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
      color: {
        primary: "text-blue",
        secondary: "text-gray",
      },
    },
  });
  expect(style.variantProps).toEqual(["size", "color", "class", "className"]);
});

test("cv variantProps includes class and className even without variants", () => {
  const style = cv({
    class: "base",
  });
  expect(style.variantProps).toEqual(["class", "className"]);
});

test("cv splitProps separates variant props from rest", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  const [variantProps, rest] = style.splitProps({
    size: "small",
    onClick: () => {},
    id: "my-id",
  });
  expect(variantProps).toEqual({ size: "small" });
  expect(rest).toEqual({ onClick: expect.any(Function), id: "my-id" });
});

test("cv splitProps includes class and className in variant props", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  const [variantProps, rest] = style.splitProps({
    size: "large",
    class: "custom",
    className: "another",
    "data-testid": "test",
  });
  expect(variantProps).toEqual({
    size: "large",
    class: "custom",
    className: "another",
  });
  expect(rest).toEqual({ "data-testid": "test" });
});

test("cv splitProps returns empty objects when no props match", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  const [variantProps, rest] = style.splitProps({
    id: "my-id",
    "aria-label": "Label",
  });
  expect(variantProps).toEqual({});
  expect(rest).toEqual({ id: "my-id", "aria-label": "Label" });
});

test("cv splitProps handles empty props object", () => {
  const style = cv({
    class: "base",
  });
  const [variantProps, rest] = style.splitProps({});
  expect(variantProps).toEqual({});
  expect(rest).toEqual({});
});

test("cv applies compound variants when all conditions match", () => {
  const style = cv({
    class: "base",
    variants: {
      intent: {
        primary: "bg-blue",
        secondary: "bg-gray",
      },
      size: {
        small: "text-sm",
        medium: "text-base",
      },
    },
    compoundVariants: [
      {
        intent: "primary",
        size: "medium",
        class: "uppercase",
      },
    ],
  });
  expect(style({ intent: "primary", size: "medium" })).toBe(
    "base bg-blue text-base uppercase",
  );
});

test("cv does not apply compound variants when conditions don't match", () => {
  const style = cv({
    class: "base",
    variants: {
      intent: {
        primary: "bg-blue",
        secondary: "bg-gray",
      },
      size: {
        small: "text-sm",
        medium: "text-base",
      },
    },
    compoundVariants: [
      {
        intent: "primary",
        size: "medium",
        class: "uppercase",
      },
    ],
  });
  expect(style({ intent: "primary", size: "small" })).toBe(
    "base bg-blue text-sm",
  );
  expect(style({ intent: "secondary", size: "medium" })).toBe(
    "base bg-gray text-base",
  );
});

test("cv applies compound variants with array conditions", () => {
  const style = cv({
    class: "base",
    variants: {
      intent: {
        primary: "bg-blue",
        secondary: "bg-gray",
        danger: "bg-red",
      },
      size: {
        small: "text-sm",
        medium: "text-base",
      },
    },
    compoundVariants: [
      {
        intent: ["primary", "secondary"],
        size: "medium",
        class: "font-bold",
      },
    ],
  });
  expect(style({ intent: "primary", size: "medium" })).toBe(
    "base bg-blue text-base font-bold",
  );
  expect(style({ intent: "secondary", size: "medium" })).toBe(
    "base bg-gray text-base font-bold",
  );
  expect(style({ intent: "danger", size: "medium" })).toBe(
    "base bg-red text-base",
  );
});

test("cv applies multiple compound variants", () => {
  const style = cv({
    class: "base",
    variants: {
      intent: {
        primary: "bg-blue",
        secondary: "bg-gray",
      },
      size: {
        small: "text-sm",
        medium: "text-base",
      },
    },
    compoundVariants: [
      {
        intent: "primary",
        size: "medium",
        class: "uppercase",
      },
      {
        intent: "secondary",
        size: "small",
        class: "lowercase",
      },
    ],
  });
  expect(style({ intent: "primary", size: "medium" })).toBe(
    "base bg-blue text-base uppercase",
  );
  expect(style({ intent: "secondary", size: "small" })).toBe(
    "base bg-gray text-sm lowercase",
  );
});

test("cv compound variants support className in addition to class", () => {
  const style = cv({
    class: "base",
    variants: {
      intent: {
        primary: "bg-blue",
      },
      size: {
        medium: "text-base",
      },
    },
    compoundVariants: [
      {
        intent: "primary",
        size: "medium",
        className: "font-semibold",
      },
    ],
  });
  expect(style({ intent: "primary", size: "medium" })).toBe(
    "base bg-blue text-base font-semibold",
  );
});

test("cv compound variants with boolean conditions", () => {
  const style = cv({
    class: "base",
    variants: {
      intent: {
        primary: "bg-blue",
        secondary: "bg-gray",
      },
      disabled: {
        true: "opacity-50",
        false: "opacity-100",
      },
    },
    compoundVariants: [
      {
        intent: "primary",
        disabled: false,
        class: "hover:bg-blue-600",
      },
    ],
  });
  expect(style({ intent: "primary", disabled: false })).toBe(
    "base bg-blue opacity-100 hover:bg-blue-600",
  );
  expect(style({ intent: "primary", disabled: true })).toBe(
    "base bg-blue opacity-50",
  );
});

test("cv compound variants with default variants", () => {
  const style = cv({
    class: "base",
    variants: {
      intent: {
        primary: "bg-blue",
        secondary: "bg-gray",
      },
      size: {
        small: "text-sm",
        medium: "text-base",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "medium",
    },
    compoundVariants: [
      {
        intent: "primary",
        size: "medium",
        class: "uppercase",
      },
    ],
  });
  // Should apply compound variant with default values
  expect(style()).toBe("base bg-blue text-base uppercase");
});

test("cv compound variants come before user class/className", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        medium: "text-base",
      },
    },
    compoundVariants: [
      {
        size: "medium",
        class: "compound-class",
      },
    ],
  });
  expect(style({ size: "medium", class: "user-class" })).toBe(
    "base text-base compound-class user-class",
  );
});

test("type: variantProps has correct const type", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
      intent: {
        primary: "bg-blue",
        secondary: "bg-gray",
      },
    },
  });
  const props: readonly ("size" | "intent" | "class" | "className")[] =
    style.variantProps;
  expect(props).toEqual(["size", "intent", "class", "className"]);
});

// cx tests

test("cx concatenates strings (variadic)", () => {
  expect(cx("foo", true && "bar", "baz")).toBe("foo bar baz");
});

test("cx handles objects", () => {
  expect(cx({ foo: true, bar: false, baz: true })).toBe("foo baz");
});

test("cx handles objects (variadic)", () => {
  expect(cx({ foo: true }, { bar: false }, null, { "--foobar": "hello" })).toBe(
    "foo --foobar",
  );
});

test("cx handles arrays", () => {
  expect(cx(["foo", 0, false, "bar"])).toBe("foo bar");
});

test("cx handles arrays (variadic)", () => {
  expect(
    cx(["foo"], ["", 0, false, "bar"], [["baz", [["hello"], "there"]]]),
  ).toBe("foo bar baz hello there");
});

test("cx handles kitchen sink (with nesting)", () => {
  expect(
    cx(
      "foo",
      [1 && "bar", { baz: false, bat: null }, ["hello", ["world"]]],
      "cya",
    ),
  ).toBe("foo bar hello world cya");
});

test("cx returns empty string with no arguments", () => {
  expect(cx()).toBe("");
});

test("cx filters out all falsy values", () => {
  expect(cx("a", null, "b", undefined, false, 0, "", "c")).toBe("a b c");
});

// createCV tests

test("createCV returns cv and cx functions", () => {
  const result = createCV();
  expect(typeof result.cv).toBe("function");
  expect(typeof result.cx).toBe("function");
});

test("createCV cv works like default cv", () => {
  const { cv: customCv } = createCV();
  const style = customCv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  expect(style({ size: "small" })).toBe("base text-sm");
});

test("createCV cx works like default cx", () => {
  const { cx: customCx } = createCV();
  expect(customCx("foo", "bar", null, "baz")).toBe("foo bar baz");
});

test("createCV with transform applies transformation to cv result", () => {
  const { cv: customCv } = createCV({
    transform: (s) => s.toUpperCase(),
  });
  const style = customCv({ class: "base" });
  expect(style()).toBe("BASE");
});

test("createCV with transform applies transformation to cx result", () => {
  const { cx: customCx } = createCV({
    transform: (s) => s.toUpperCase(),
  });
  expect(customCx("foo", "bar")).toBe("FOO BAR");
});

test("createCV with transform can deduplicate classes", () => {
  const { cv: customCv } = createCV({
    transform: (s) => [...new Set(s.split(" "))].join(" "),
  });
  const style = customCv({ class: "a b a c b" });
  expect(style()).toBe("a b c");
});

test("createCV transform is called with merged class string", () => {
  const calls: string[] = [];
  const { cv: customCv } = createCV({
    transform: (s) => {
      calls.push(s);
      return s;
    },
  });
  const style = customCv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
      },
    },
  });
  style({ size: "small", class: "custom" });
  expect(calls).toEqual(["base text-sm custom"]);
});

// VariantProps tests

test("type: VariantProps extracts variant props from cv return type", () => {
  const button = cv({
    class: "btn",
    variants: {
      size: {
        sm: "text-sm",
        lg: "text-lg",
      },
      intent: {
        primary: "bg-blue",
        secondary: "bg-gray",
      },
    },
  });

  type ButtonProps = VariantProps<typeof button>;

  // Type assertion to verify the type is correct (no class/className)
  const props: ButtonProps = {
    size: "sm",
    intent: "primary",
  };
  expect(props).toBeDefined();
});

test("type: VariantProps does not include class and className", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        sm: "text-sm",
        lg: "text-lg",
      },
    },
  });
  type Props = VariantProps<typeof style>;

  // Only variant keys, not class/className
  const props: Props = { size: "sm" };
  // @ts-expect-error - class is not part of VariantProps
  const withClass: Props = { size: "sm", class: "foo" };
  expect(props).toBeDefined();
  expect(withClass).toBeDefined();
});

test("type: VariantProps makes all variant keys optional", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        sm: "text-sm",
        lg: "text-lg",
      },
    },
  });
  type Props = VariantProps<typeof style>;

  // All props should be optional
  const emptyProps: Props = {};
  const partialProps: Props = { size: "sm" };
  expect(emptyProps).toBeDefined();
  expect(partialProps).toBeDefined();
});

test("type: splitProps correctly types variant props when using an interface", () => {
  const style = cv({
    class: "base",
    variants: {
      size: {
        sm: "text-sm",
        lg: "text-lg",
      },
      variant: {
        primary: "bg-blue",
        secondary: "bg-gray",
      },
    },
  });

  // Using an interface (not type alias) to extend variant props
  interface Props extends VariantProps<typeof style> {
    id?: string;
    onClick?: () => void;
  }

  const props: Props = {
    size: "sm",
    variant: "primary",
    id: "my-id",
    onClick: () => {},
  };

  const [variantProps, rest] = style.splitProps(props);

  // Verify variant props are correctly typed (not an empty record)
  variantProps.size;
  variantProps.variant;
  // @ts-expect-error - id is not a variant prop
  variantProps.id;

  // Verify rest props are correctly typed
  rest.id;
  rest.onClick;
  // @ts-expect-error - size is not in rest
  rest.size;

  expect(variantProps).toEqual({ size: "sm", variant: "primary" });
  expect(rest).toEqual({ id: "my-id", onClick: expect.any(Function) });
});

test("cv extended variantProps includes parent variant keys", () => {
  const parent = cv({
    class: "parent",
    variants: {
      size: {
        small: "size-small",
        large: "size-large",
      },
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
    variants: {
      color: {
        red: "color-red",
        blue: "color-blue",
      },
    },
  });
  // variantProps should include both parent and child variant keys
  expect(child.variantProps).toContain("size");
  expect(child.variantProps).toContain("color");
  expect(child.variantProps).toContain("class");
  expect(child.variantProps).toContain("className");
});

test("cv extended variantProps includes multiple parent variant keys", () => {
  const first = cv({
    class: "first",
    variants: {
      intent: {
        primary: "intent-primary",
        secondary: "intent-secondary",
      },
    },
  });
  const second = cv({
    class: "second",
    variants: {
      rounded: {
        true: "rounded-true",
        false: "rounded-false",
      },
    },
  });
  const child = cv({
    extend: [first, second],
    class: "child",
    variants: {
      size: {
        small: "size-small",
      },
    },
  });
  expect(child.variantProps).toContain("intent");
  expect(child.variantProps).toContain("rounded");
  expect(child.variantProps).toContain("size");
});

test("cv extended defaultVariants includes parent default variants", () => {
  const parent = cv({
    class: "parent",
    variants: {
      size: {
        small: "size-small",
        large: "size-large",
      },
    },
    defaultVariants: {
      size: "small",
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
    variants: {
      color: {
        red: "color-red",
        blue: "color-blue",
      },
    },
    defaultVariants: {
      color: "red",
    },
  });
  // defaultVariants should include both parent and child defaults
  expect(child.defaultVariants).toEqual({
    size: "small",
    color: "red",
  });
});

test("cv extended defaultVariants merges multiple parents", () => {
  const first = cv({
    class: "first",
    variants: {
      intent: {
        primary: "intent-primary",
        secondary: "intent-secondary",
      },
    },
    defaultVariants: {
      intent: "primary",
    },
  });
  const second = cv({
    class: "second",
    variants: {
      rounded: {
        true: "rounded-true",
        false: "rounded-false",
      },
    },
    defaultVariants: {
      rounded: true,
    },
  });
  const child = cv({
    extend: [first, second],
    class: "child",
  });
  expect(child.defaultVariants).toEqual({
    intent: "primary",
    rounded: true,
  });
});

test("cv extended child defaultVariants override parent defaults in defaultVariants property", () => {
  const parent = cv({
    class: "parent",
    variants: {
      size: {
        small: "size-small",
        large: "size-large",
      },
    },
    defaultVariants: {
      size: "small",
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
    defaultVariants: {
      size: "large",
    },
  });
  // Child's default should override parent's default
  expect(child.defaultVariants).toEqual({
    size: "large",
  });
});

test("cv extended splitProps correctly separates parent variant props", () => {
  const parent = cv({
    class: "parent",
    variants: {
      size: {
        small: "size-small",
        large: "size-large",
      },
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
    variants: {
      color: {
        red: "color-red",
        blue: "color-blue",
      },
    },
  });
  const [variantProps, rest] = child.splitProps({
    size: "small",
    color: "red",
    id: "my-id",
  });
  expect(variantProps).toEqual({ size: "small", color: "red" });
  expect(rest).toEqual({ id: "my-id" });
});

test("type: compoundVariants rejects unknown variant keys", () => {
  cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
    compoundVariants: [
      {
        size: "small",
        // @ts-expect-error - "unknown" is not a defined variant key
        unknown: "value",
        class: "compound",
      },
    ],
  });
});

test("type: compoundVariants rejects invalid variant values", () => {
  cv({
    class: "base",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
    compoundVariants: [
      {
        // @ts-expect-error - "medium" is not a valid size option
        size: "medium",
        class: "compound",
      },
    ],
  });
});

test("type: extended cv compoundVariants accepts parent variant keys", () => {
  const parent = cv({
    class: "parent",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  // This should compile without error
  cv({
    extend: [parent],
    class: "child",
    variants: {
      color: {
        red: "text-red",
        blue: "text-blue",
      },
    },
    compoundVariants: [
      {
        size: "small",
        color: "red",
        class: "compound",
      },
    ],
  });
});

test("type: extended variantProps has correct type", () => {
  const parent = cv({
    class: "parent",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
    variants: {
      color: {
        red: "text-red",
        blue: "text-blue",
      },
    },
  });
  // Type assertion to verify variantProps includes both parent and child keys
  const props: readonly ("size" | "color" | "class" | "className")[] =
    child.variantProps;
  expect(props).toContain("size");
  expect(props).toContain("color");
});

test("type: extended defaultVariants has correct type", () => {
  const parent = cv({
    class: "parent",
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
    defaultVariants: {
      size: "small",
    },
  });
  const child = cv({
    extend: [parent],
    class: "child",
    variants: {
      color: {
        red: "text-red",
        blue: "text-blue",
      },
    },
    defaultVariants: {
      color: "red",
    },
  });
  // Verify type includes both parent and child default variants
  child.defaultVariants.size;
  child.defaultVariants.color;
  // @ts-expect-error - "unknown" is not a defined variant
  child.defaultVariants.unknown;
});
