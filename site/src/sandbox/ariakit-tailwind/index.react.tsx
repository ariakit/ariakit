import type { VariantProps } from "clava";
import { cv, splitProps } from "clava";
import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";

const layer = cv({
  class: ["ak-layer", "font-mono flex gap-(--ak-frame-padding) content-center"],
  variants: {
    $layer: {
      0: "ak-layer-0",
      10: "ak-layer-10",
      20: "ak-layer-20",
      30: "ak-layer-30",
      40: "ak-layer-40",
      50: "ak-layer-50",
      60: "ak-layer-60",
      70: "ak-layer-70",
      80: "ak-layer-80",
      90: "ak-layer-90",
      100: "ak-layer-100",
    },
    $layerState: {
      0: "ak-state-0",
      10: "ak-state-10",
      20: "ak-state-20",
      30: "ak-state-30",
      40: "ak-state-40",
      50: "ak-state-50",
      60: "ak-state-60",
      70: "ak-state-70",
      80: "ak-state-80",
      90: "ak-state-90",
      100: "ak-state-100",
    },
    $push: {
      0: "ak-layer-push-0",
      10: "ak-layer-push-10",
      20: "ak-layer-push-20",
      30: "ak-layer-push-30",
      40: "ak-layer-push-40",
      50: "ak-layer-push-50",
      60: "ak-layer-push-60",
      70: "ak-layer-push-70",
      80: "ak-layer-push-80",
      90: "ak-layer-push-90",
      100: "ak-layer-push-100",
    },
    $contrast: {
      default: "ak-layer-contrast",
      0: "ak-layer-contrast ak-layer-contrast-0",
      10: "ak-layer-contrast ak-layer-contrast-10",
      20: "ak-layer-contrast ak-layer-contrast-20",
      30: "ak-layer-contrast ak-layer-contrast-30",
      40: "ak-layer-contrast ak-layer-contrast-40",
      50: "ak-layer-contrast ak-layer-contrast-50",
      60: "ak-layer-contrast ak-layer-contrast-60",
      70: "ak-layer-contrast ak-layer-contrast-70",
      80: "ak-layer-contrast ak-layer-contrast-80",
      90: "ak-layer-contrast ak-layer-contrast-90",
      100: "ak-layer-contrast ak-layer-contrast-100",
    },
    $color: {
      primary: "ak-layer-primary",
      secondary: "ak-layer-secondary",
      blue: "ak-layer-blue-500",
      red: "ak-layer-red-500",
      green: "ak-layer-green-500",
    },
    $bg: {
      blue: "ak-layer-blue-500",
    },
    $mix: {
      0: "ak-layer-mix-0",
      10: "ak-layer-mix-10",
      20: "ak-layer-mix-20",
      30: "ak-layer-mix-30",
      40: "ak-layer-mix-40",
      50: "ak-layer-mix-50",
      60: "ak-layer-mix-60",
      70: "ak-layer-mix-70",
      80: "ak-layer-mix-80",
      90: "ak-layer-mix-90",
      100: "ak-layer-mix-100",
    },
    $mixColor: {
      red: "ak-layer-mix-red-500",
    },
    $lighten: {
      0: "ak-layer-lighten-0",
      10: "ak-layer-lighten-10",
      20: "ak-layer-lighten-20",
      30: "ak-layer-lighten-30",
      40: "ak-layer-lighten-40",
      50: "ak-layer-lighten-50",
      60: "ak-layer-lighten-60",
      70: "ak-layer-lighten-70",
      80: "ak-layer-lighten-80",
      90: "ak-layer-lighten-90",
      100: "ak-layer-lighten-100",
    },
    $darken: {
      0: "ak-layer-darken-0",
      10: "ak-layer-darken-10",
      20: "ak-layer-darken-20",
      30: "ak-layer-darken-30",
      40: "ak-layer-darken-40",
      50: "ak-layer-darken-50",
      60: "ak-layer-darken-60",
      70: "ak-layer-darken-70",
      80: "ak-layer-darken-80",
      90: "ak-layer-darken-90",
      100: "ak-layer-darken-100",
    },
    $frame: "ak-frame",
    $forceRounded: "ak-frame-force",
    $rounded: {
      false: "",
      none: "ak-frame-none",
      sm: "ak-frame-sm",
      md: "ak-frame-md",
      lg: "ak-frame-lg",
      xl: "ak-frame-xl",
      "2xl": "ak-frame-2xl",
      "3xl": "ak-frame-3xl",
      full: "ak-frame-full",
    },
    $p: {
      unset: "",
      0: "ak-frame-p-0",
      1: "ak-frame-p-1",
      2: "ak-frame-p-2",
      3: "ak-frame-p-3",
      4: "ak-frame-p-4",
      5: "ak-frame-p-5",
    },
    $m: {
      unset: "",
      0: "ak-frame-m-0",
      1: "ak-frame-m-1",
      2: "ak-frame-m-2",
      3: "ak-frame-m-3",
      4: "ak-frame-m-4",
      5: "ak-frame-m-5",
      "-0.5": "-ak-frame-m-0.5",
      "-1": "-ak-frame-m-1",
      "-2": "-ak-frame-m-2",
      "-3": "-ak-frame-m-3",
      "-4": "-ak-frame-m-4",
      "-5": "-ak-frame-m-5",
    },
    $stretch: {
      true: "ak-frame-cover",
    },
    $flow: {
      unset: "",
      wrap: "ak-frame-row flex-wrap items-start",
      row: "ak-frame-row flex-row",
      col: "ak-frame-col flex-col",
    },
    $position: {
      unset: "",
      start: "ak-frame-start",
      end: "ak-frame-end",
    },
    $border: {
      false: "",
      border: "ak-frame-border-(--border-width)",
      ring: "ak-frame-ring-(--border-width)",
      bordering: "ak-frame-bordering-(--border-width)",
    },
    $borderColor: {
      false: "",
      blue: "ak-edge-blue-500",
      blueRel: "ak-edge-blue ak-edge-vivid ak-edge-40 ak-edge-push-60",
      red: "ak-edge-red-500",
      green: "ak-edge-green-500",
      yellow: "ak-edge-yellow-500",
    },
    $borderWidth: {
      false: "",
      0: "[--border-width:0px]",
      1: "[--border-width:1px]",
      2: "[--border-width:2px]",
      3: "[--border-width:3px]",
      4: "[--border-width:4px]",
    },
    $textLevel: {
      0: "ak-ink-0",
      10: "ak-ink-10",
      20: "ak-ink-20",
      30: "ak-ink-30",
      40: "ak-ink-40",
      50: "ak-ink-50",
      60: "ak-ink-60",
      70: "ak-ink-70",
      80: "ak-ink-80",
      90: "ak-ink-90",
      100: "ak-ink-100",
    },
    $textColor: {
      red: "*:ak-text *:ak-text-red-500",
      green: "*:ak-text *:ak-text-green-500",
      blue: "*:ak-text *:ak-text-blue-500",
      orange: "*:ak-text *:ak-text-orange-500",
      purple: "*:ak-text *:ak-text-purple-500",
    },
  },
  defaultVariants: {
    $frame: true,
    $forceRounded: false,
    $rounded: "2xl",
    $p: 1,
    $m: "unset",
    $stretch: false,
    $flow: "wrap",
    $position: "unset",
    $border: "bordering",
    $borderWidth: 1,
  },
});

interface LayerProps
  extends
    Omit<ComponentProps<"section">, "children">,
    VariantProps<typeof layer> {
  label?: ReactNode | ((props: VariantProps<typeof layer>) => ReactNode);
  children?: ReactNode | ((props: VariantProps<typeof layer>) => ReactNode);
  getVariants?: (
    props: VariantProps<typeof layer>,
  ) => VariantProps<typeof layer>;
}

function Layer({ label, children, getVariants, ...props }: LayerProps) {
  const id = useId();
  const [layerProps, rest] = splitProps(props, layer);
  const labelElement =
    typeof label === "function" ? label(layer.getVariants(layerProps)) : label;
  return (
    <section
      aria-labelledby={label ? id : undefined}
      {...rest}
      {...layer.jsx(
        getVariants ? getVariants(layer.getVariants(layerProps)) : layerProps,
      )}
    >
      {labelElement && <div id={id}>{labelElement}</div>}
      {typeof children === "function"
        ? children(layer.getVariants(layerProps))
        : children}
    </section>
  );
}

interface LayersProps extends ComponentProps<typeof Layer> {}

function Layers(props: LayersProps) {
  const label = props.label ?? ((props) => `ak-layer-${props.$layer}`);
  return (
    <>
      <Layer {...props} $layer={0} label={label} />
      <Layer {...props} $layer={10} label={label} />
      <Layer {...props} $layer={20} label={label} />
      <Layer {...props} $layer={30} label={label} />
      <Layer {...props} $layer={40} label={label} />
      <Layer {...props} $layer={50} label={label} />
      <Layer {...props} $layer={60} label={label} />
      <Layer {...props} $layer={70} label={label} />
      <Layer {...props} $layer={80} label={label} />
      <Layer {...props} $layer={90} label={label} />
      <Layer {...props} $layer={100} label={label} />
    </>
  );
}

function LayersPush(props: LayersProps) {
  const label = props.label ?? ((props) => `ak-layer-push-${props.$push}`);
  return (
    <>
      <Layer {...props} $push={0} label={label} />
      <Layer {...props} $push={10} label={label} />
      <Layer {...props} $push={20} label={label} />
      <Layer {...props} $push={30} label={label} />
      <Layer {...props} $push={40} label={label} />
      <Layer {...props} $push={50} label={label} />
      <Layer {...props} $push={60} label={label} />
      <Layer {...props} $push={70} label={label} />
      <Layer {...props} $push={80} label={label} />
      <Layer {...props} $push={90} label={label} />
      <Layer {...props} $push={100} label={label} />
    </>
  );
}

function LayersColor(props: LayersProps) {
  const label = props.label ?? ((props) => `ak-layer-${props.$layer}`);
  return (
    <>
      <Layer {...props} $bg="blue" $layer={0} label={label} />
      <Layer {...props} $bg="blue" $layer={10} label={label} />
      <Layer {...props} $bg="blue" $layer={20} label={label} />
      <Layer {...props} $bg="blue" $layer={30} label={label} />
      <Layer {...props} $bg="blue" $layer={40} label={label} />
      <Layer {...props} $bg="blue" $layer={50} label={label} />
      <Layer {...props} $bg="blue" $layer={60} label={label} />
      <Layer {...props} $bg="blue" $layer={70} label={label} />
      <Layer {...props} $bg="blue" $layer={80} label={label} />
      <Layer {...props} $bg="blue" $layer={90} label={label} />
      <Layer {...props} $bg="blue" $layer={100} label={label} />
    </>
  );
}

function LayersMix(props: LayersProps) {
  const label = props.label ?? ((props) => `ak-layer-mix-${props.$mixColor}`);
  return (
    <>
      <Layer {...props} $mixColor="red" $mix={0} label={label} />
      <Layer {...props} $mixColor="red" $mix={10} label={label} />
      <Layer {...props} $mixColor="red" $mix={20} label={label} />
      <Layer {...props} $mixColor="red" $mix={30} label={label} />
      <Layer {...props} $mixColor="red" $mix={40} label={label} />
      <Layer {...props} $mixColor="red" $mix={50} label={label} />
      <Layer {...props} $mixColor="red" $mix={60} label={label} />
      <Layer {...props} $mixColor="red" $mix={70} label={label} />
      <Layer {...props} $mixColor="red" $mix={80} label={label} />
      <Layer {...props} $mixColor="red" $mix={90} label={label} />
      <Layer {...props} $mixColor="red" $mix={100} label={label} />
    </>
  );
}

function getFrom<K extends keyof any, T>(
  key: K | undefined,
  value: T,
  map: NoInfer<{ [key in K]?: T }>,
) {
  return key != null ? (map[key] ?? value) : value;
}

function FrameStretchRow({
  label,
  parentClass = "",
  childClass = "",
}: {
  label: string;
  parentClass?: string;
  childClass?: string;
}) {
  return (
    <Layer
      label={label}
      className={parentClass}
      $rounded="xl"
      $p={3}
      $border={false}
      $flow="col"
    >
      <Layer
        label="cover"
        className={childClass}
        $stretch
        $p={2}
        $border={false}
      />
    </Layer>
  );
}

export default function Example() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Layer label="ak-layer-<number>" $flow="col">
        <Layer $stretch>
          <Layers $flow="col">
            {(root) => (
              <Layer
                $flow="row"
                getVariants={(props) => ({
                  ...props,
                  $borderWidth: getFrom(root.$layer, props.$borderWidth, {
                    10: 4,
                    20: 2,
                    30: 2,
                    40: 2,
                    70: 2,
                    80: 2,
                  }),
                  $stretch: getFrom(root.$layer, props.$stretch, {
                    20: true,
                    30: true,
                    70: true,
                    90: true,
                  }),
                  $borderColor: getFrom(root.$layer, props.$borderColor, {
                    10: "red",
                    20: "blueRel",
                    50: "blue",
                    70: "blueRel",
                    80: "blueRel",
                  }),
                })}
              >
                <Layers
                  label={(props) => props.$layer}
                  getVariants={(props) => ({
                    ...props,
                    $textColor: getFrom(props.$layer, props.$textColor, {
                      20: "blue",
                      50: "red",
                      90: "green",
                    }),
                    $textLevel: getFrom(props.$layer, props.$textLevel, {
                      20: 0,
                      70: 0,
                      100: 0,
                    }),
                    $stretch: getFrom(props.$layer, props.$stretch, {
                      0: true,
                      50: true,
                      100: true,
                    }),
                    $m: getFrom(props.$layer, props.$m, {
                      20: "-0.5",
                      80: "-2",
                    }),
                  })}
                />
              </Layer>
            )}
          </Layers>
        </Layer>
      </Layer>
      <Layer label="ak-layer-push-<number>" $flow="col">
        <Layer $stretch>
          <LayersPush $flow="col">
            {(root) => (
              <Layer
                $flow="row"
                getVariants={(props) => ({
                  ...props,
                  $borderWidth: getFrom(root.$push, props.$borderWidth, {
                    10: 4,
                    20: 2,
                    30: 2,
                    40: 2,
                    70: 2,
                    80: 2,
                  }),
                  $stretch: getFrom(root.$push, props.$stretch, {
                    20: true,
                    30: true,
                    70: true,
                    90: true,
                  }),
                  $borderColor: getFrom(root.$push, props.$borderColor, {
                    10: "red",
                    20: "blueRel",
                    50: "blue",
                    70: "blueRel",
                    80: "blueRel",
                  }),
                })}
              >
                <LayersPush
                  label={(props) => props.$push}
                  getVariants={(props) => ({
                    ...props,
                    $textLevel: getFrom(props.$push, props.$textLevel, {
                      20: 0,
                      70: 0,
                      100: 0,
                    }),
                    $stretch: getFrom(props.$push, props.$stretch, {
                      0: true,
                      50: true,
                      100: true,
                    }),
                    $m: getFrom(props.$push, props.$m, {
                      20: "-0.5",
                      80: "-2",
                    }),
                  })}
                />
              </Layer>
            )}
          </LayersPush>
        </Layer>
      </Layer>
      <Layer label="ak-layer-blue" $flow="col">
        <Layer $stretch>
          <LayersColor $flow="col">
            {(root) => (
              <>
                <Layer
                  $flow="row"
                  getVariants={(props) => ({
                    ...props,
                    $borderWidth: getFrom(root.$layer, props.$borderWidth, {
                      10: 4,
                      20: 2,
                      30: 2,
                      40: 2,
                      70: 2,
                      80: 2,
                    }),
                    $stretch: getFrom(root.$layer, props.$stretch, {
                      20: true,
                      30: true,
                      70: true,
                      90: true,
                    }),
                    $borderColor: getFrom(root.$layer, props.$borderColor, {
                      10: "red",
                      20: "blueRel",
                      50: "blue",
                      70: "blueRel",
                      80: "blueRel",
                    }),
                  })}
                >
                  <Layers label={(props) => props.$layer} />
                </Layer>
                <Layer $flow="row">
                  <LayersMix
                    label={(props) => props.$mix}
                    getVariants={(props) => ({
                      ...props,
                      $textColor: getFrom(props.$mix, props.$textColor, {
                        20: "blue",
                        70: "red",
                        90: "green",
                      }),
                    })}
                  />
                </Layer>
              </>
            )}
          </LayersColor>
        </Layer>
      </Layer>
      <Layer
        label="Padding cap: parent padding >= 1rem → child uses own radius"
        $flow="col"
      >
        <Layer $stretch $flow="row">
          {([1, 2, 3, 4, 5] as const).map((p) => (
            <Layer
              key={p}
              label={`p=${p}`}
              $rounded="2xl"
              $p={p}
              $border="border"
              $borderWidth={2}
            >
              <Layer
                label="nested"
                $rounded="xl"
                $p={1}
                $border="border"
                $borderWidth={1}
              />
            </Layer>
          ))}
        </Layer>
      </Layer>
      <Layer label="Padding cap with rounded-full parent" $flow="col">
        <Layer $stretch $flow="row">
          {([1, 2, 3, 4, 5] as const).map((p) => (
            <Layer
              key={p}
              label={`p=${p}`}
              $rounded="full"
              $forceRounded
              $p={p}
              $border="border"
              $borderWidth={2}
            >
              <Layer
                label="nested"
                $rounded="xl"
                $p={1}
                $border="border"
                $borderWidth={1}
              />
            </Layer>
          ))}
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-contrast (parent-relative) — primary on varied backgrounds"
        $flow="col"
      >
        <Layer $stretch $flow="col">
          {([0, 20, 40, 60, 80, 100] as const).map((bg) => (
            <Layer
              key={bg}
              $layer={bg}
              $flow="row"
              label={`parent: ak-layer-${bg}`}
            >
              {([0, 10, 20, 30, 50, 70, 100] as const).map((contrast) => (
                <Layer
                  key={contrast}
                  $color="primary"
                  $contrast={contrast}
                  $p={1}
                  label={contrast}
                />
              ))}
            </Layer>
          ))}
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-contrast (parent-relative) — blue on varied backgrounds"
        $flow="col"
      >
        <Layer $stretch $flow="col">
          {([0, 20, 40, 60, 80, 100] as const).map((bg) => (
            <Layer
              key={bg}
              $layer={bg}
              $flow="row"
              label={`parent: ak-layer-${bg}`}
            >
              {([0, 10, 20, 30, 50, 70, 100] as const).map((contrast) => (
                <Layer
                  key={contrast}
                  $color="blue"
                  $contrast={contrast}
                  $p={1}
                  label={contrast}
                />
              ))}
            </Layer>
          ))}
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-contrast default (25) vs explicit values"
        $flow="col"
      >
        <Layer $stretch $flow="col">
          {([0, 20, 40, 60, 80, 100] as const).map((bg) => (
            <Layer
              key={bg}
              $layer={bg}
              $flow="row"
              label={`parent: ak-layer-${bg}`}
            >
              <Layer
                $color="primary"
                $contrast="default"
                $p={1}
                label="default"
              />
              <Layer $color="primary" $contrast={0} $p={1} label="0" />
              <Layer $color="primary" $contrast={20} $p={1} label="20" />
              <Layer $color="primary" $contrast={50} $p={1} label="50" />
            </Layer>
          ))}
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-push (self-relative) vs ak-layer-contrast (parent-relative)"
        $flow="col"
      >
        <Layer $stretch $flow="col">
          <Layer $layer={20} $flow="row" label="parent: ak-layer-20">
            <Layer $color="primary" $push={50} $p={1} label="push-50" />
            <Layer $color="primary" $contrast={50} $p={1} label="contrast-50" />
            <Layer $color="red" $push={50} $p={1} label="push-50" />
            <Layer $color="red" $contrast={50} $p={1} label="contrast-50" />
          </Layer>
          <Layer $layer={80} $flow="row" label="parent: ak-layer-80">
            <Layer $color="primary" $push={50} $p={1} label="push-50" />
            <Layer $color="primary" $contrast={50} $p={1} label="contrast-50" />
            <Layer $color="red" $push={50} $p={1} label="push-50" />
            <Layer $color="red" $contrast={50} $p={1} label="contrast-50" />
          </Layer>
        </Layer>
      </Layer>
      <Layer
        label="ak-text on ak-layer-[#131418]"
        className="ak-layer-[#131418]"
        $flow="row"
      >
        <Layer
          className="ak-layer-[#131418] *:ak-text *:ak-text-[#808080]"
          $p={1}
          label="#808080"
        />
        <Layer
          className="ak-layer-[#131418] *:ak-text *:ak-text-[#757575]"
          $p={1}
          label="#757575"
        />
        <Layer
          className="ak-layer-[#131418] *:ak-text *:ak-text-red-500"
          $p={1}
          label="red-500"
        />
        <Layer
          className="ak-layer-[#131418] *:ak-text *:ak-text-blue-500"
          $p={1}
          label="blue-500"
        />
        <Layer
          className="ak-layer-[#131418] *:ak-text *:ak-text-green-500"
          $p={1}
          label="green-500"
        />
      </Layer>
      <Layer
        label="ak-text on ak-layer-[#0C0E12]"
        className="ak-layer-[#0C0E12]"
        $flow="row"
      >
        <Layer
          className="ak-layer-[#0C0E12] *:ak-text *:ak-text-[#808080]"
          $p={1}
          label="#808080"
        />
        <Layer
          className="ak-layer-[#0C0E12] *:ak-text *:ak-text-red-500"
          $p={1}
          label="red-500"
        />
        <Layer
          className="ak-layer-[#0C0E12] *:ak-text *:ak-text-blue-500"
          $p={1}
          label="blue-500"
        />
        <Layer
          className="ak-layer-[#0C0E12] *:ak-text *:ak-text-green-500"
          $p={1}
          label="green-500"
        />
      </Layer>
      <Layer
        label="ak-text vivid hex on ak-layer-[#131418]"
        className="ak-layer-[#131418]"
        $flow="row"
      >
        <Layer
          className="ak-layer-[#131418] *:ak-text *:ak-text-[#42FA7D]"
          $p={1}
          label="#42FA7D"
        />
        <Layer
          className="ak-layer-[#131418] *:ak-text *:ak-text-[#FF5C5C]"
          $p={1}
          label="#FF5C5C"
        />
        <Layer
          className="ak-layer-[#131418] *:ak-text *:ak-text-[#5CB8FF]"
          $p={1}
          label="#5CB8FF"
        />
        <Layer
          className="ak-layer-[#131418] *:ak-text *:ak-text-[#FFD23F]"
          $p={1}
          label="#FFD23F"
        />
        <Layer
          className="ak-layer-[#131418] *:ak-text *:ak-text-[#D67BFF]"
          $p={1}
          label="#D67BFF"
        />
      </Layer>
      <Layer label="ak-text colored text on all backgrounds" $flow="col">
        <Layer $stretch $flow="col">
          <Layers
            label={(props) => `ak-layer-${props.$layer}`}
            $flow="row"
            getVariants={(props) => ({
              ...props,
              $textColor: getFrom<
                number,
                "red" | "blue" | "green" | "orange" | "purple"
              >(props.$layer, "red", {
                20: "blue",
                40: "green",
                60: "orange",
                80: "purple",
              }),
            })}
          >
            {() => (
              <Layer $flow="row">
                <Layers
                  label={(props) => props.$layer}
                  getVariants={(props) => ({
                    ...props,
                    $textColor: getFrom(props.$layer, props.$textColor, {
                      0: "red",
                      20: "blue",
                      40: "green",
                      60: "orange",
                      80: "purple",
                    }),
                  })}
                />
              </Layer>
            )}
          </Layers>
        </Layer>
      </Layer>
      {/* frame-cover: border/ring combinations (2px) */}
      <section className="ak-layer ak-frame ak-frame-2xl ak-frame-p-3 ak-frame-col flex flex-col gap-(--ak-frame-padding) font-mono">
        <div>frame-cover: border/ring (2px)</div>
        <FrameStretchRow
          label="parent: border / child: border"
          parentClass="ak-frame-border-2"
          childClass="ak-frame-border-2"
        />
        <FrameStretchRow
          label="parent: border / child: ring"
          parentClass="ak-frame-border-2"
          childClass="ak-frame-ring-2"
        />
        <FrameStretchRow
          label="parent: ring / child: border"
          parentClass="ak-frame-ring-2"
          childClass="ak-frame-border-2"
        />
        <FrameStretchRow
          label="parent: ring / child: ring"
          parentClass="ak-frame-ring-2"
          childClass="ak-frame-ring-2"
        />
        <FrameStretchRow
          label="parent: bordering / child: bordering"
          parentClass="ak-frame-bordering-2"
          childClass="ak-frame-bordering-2"
        />
        <FrameStretchRow
          label="parent: border / child: none"
          parentClass="ak-frame-border-2"
        />
        <FrameStretchRow
          label="parent: ring / child: none"
          parentClass="ak-frame-ring-2"
        />
        <FrameStretchRow
          label="parent: none / child: border"
          childClass="ak-frame-border-2"
        />
        <FrameStretchRow
          label="parent: none / child: ring"
          childClass="ak-frame-ring-2"
        />
      </section>
      {/* frame-cover: mixed border widths */}
      <section className="ak-layer ak-frame ak-frame-2xl ak-frame-p-3 ak-frame-col flex flex-col gap-(--ak-frame-padding) font-mono">
        <div>frame-cover: mixed border widths</div>
        <FrameStretchRow
          label="parent: border(2) / child: border(1)"
          parentClass="ak-frame-border-2"
          childClass="ak-frame-border-1"
        />
        <FrameStretchRow
          label="parent: border(1) / child: border(2)"
          parentClass="ak-frame-border-1"
          childClass="ak-frame-border-2"
        />
        <FrameStretchRow
          label="parent: ring(2) / child: ring(1)"
          parentClass="ak-frame-ring-2"
          childClass="ak-frame-ring-1"
        />
        <FrameStretchRow
          label="parent: ring(1) / child: ring(2)"
          parentClass="ak-frame-ring-1"
          childClass="ak-frame-ring-2"
        />
        <FrameStretchRow
          label="parent: border(2) / child: ring(1)"
          parentClass="ak-frame-border-2"
          childClass="ak-frame-ring-1"
        />
        <FrameStretchRow
          label="parent: ring(2) / child: border(1)"
          parentClass="ak-frame-ring-2"
          childClass="ak-frame-border-1"
        />
        <FrameStretchRow
          label="parent: bordering(2) / child: bordering(1)"
          parentClass="ak-frame-bordering-2"
          childClass="ak-frame-bordering-1"
        />
        <FrameStretchRow
          label="parent: bordering(1) / child: bordering(2)"
          parentClass="ak-frame-bordering-1"
          childClass="ak-frame-bordering-2"
        />
      </section>
      {/* frame-cover + frame-m-*: margin with concentric radius */}
      <Layer
        label="frame-cover + frame-m-*"
        $rounded="3xl"
        $p={2}
        $flow="col"
        $border={false}
        className="font-mono"
      >
        <FrameStretchRow
          label="border + m-1"
          parentClass="ak-frame-border-2"
          childClass="ak-frame-border-2 ak-frame-m-1"
        />
        <FrameStretchRow
          label="border + m-2"
          parentClass="ak-frame-border-2"
          childClass="ak-frame-border-2 ak-frame-m-2"
        />
        <FrameStretchRow
          label="border + m-3"
          parentClass="ak-frame-border-2"
          childClass="ak-frame-border-2 ak-frame-m-3"
        />
        <FrameStretchRow
          label="ring + m-1"
          parentClass="ak-frame-ring-2"
          childClass="ak-frame-ring-2 ak-frame-m-1"
        />
        <FrameStretchRow
          label="ring + m-2"
          parentClass="ak-frame-ring-2"
          childClass="ak-frame-ring-2 ak-frame-m-2"
        />
        <FrameStretchRow label="no border + m-1" childClass="ak-frame-m-1" />
        <FrameStretchRow label="no border + m-2" childClass="ak-frame-m-2" />
        <FrameStretchRow
          label="border + -m-1"
          parentClass="ak-frame-border-2"
          childClass="ak-frame-border-2 -ak-frame-m-1"
        />
        <FrameStretchRow
          label="border + -m-2"
          parentClass="ak-frame-border-2"
          childClass="ak-frame-border-2 -ak-frame-m-2"
        />
        <FrameStretchRow label="no border + -m-1" childClass="-ak-frame-m-1" />
      </Layer>
    </div>
  );
}
