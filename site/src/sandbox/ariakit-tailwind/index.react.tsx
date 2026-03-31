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
    $contrast: {
      0: "ak-layer-contrast-0",
      10: "ak-layer-contrast-10",
      20: "ak-layer-contrast-20",
      30: "ak-layer-contrast-30",
      40: "ak-layer-contrast-40",
      50: "ak-layer-contrast-50",
      60: "ak-layer-contrast-60",
      70: "ak-layer-contrast-70",
      80: "ak-layer-contrast-80",
      90: "ak-layer-contrast-90",
      100: "ak-layer-contrast-100",
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
      overflow: "ak-frame-overflow",
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
      blueRel: "ak-edge-blue ak-edge-vivid ak-edge-40 ak-edge-contrast-60",
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
      0: "ak-text-0",
      10: "ak-text-10",
      20: "ak-text-20",
      30: "ak-text-30",
      40: "ak-text-40",
      50: "ak-text-50",
      60: "ak-text-60",
      70: "ak-text-70",
      80: "ak-text-80",
      90: "ak-text-90",
      100: "ak-text-100",
    },
    $textColor: {
      red: "*:ak-text *:ak-text-red-500",
      green: "*:ak-text *:ak-text-green-500",
      blue: "*:ak-text *:ak-text-blue-500",
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

function LayersContrast(props: LayersProps) {
  const label =
    props.label ?? ((props) => `ak-layer-contrast-${props.$contrast}`);
  return (
    <>
      <Layer {...props} $contrast={0} label={label} />
      <Layer {...props} $contrast={10} label={label} />
      <Layer {...props} $contrast={20} label={label} />
      <Layer {...props} $contrast={30} label={label} />
      <Layer {...props} $contrast={40} label={label} />
      <Layer {...props} $contrast={50} label={label} />
      <Layer {...props} $contrast={60} label={label} />
      <Layer {...props} $contrast={70} label={label} />
      <Layer {...props} $contrast={80} label={label} />
      <Layer {...props} $contrast={90} label={label} />
      <Layer {...props} $contrast={100} label={label} />
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

export default function Example() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Layer label="ak-layer-<number>" $flow="col">
        <Layer $stretch="overflow">
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
                    20: "overflow",
                    30: true,
                    70: true,
                    90: "overflow",
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
                      0: "overflow",
                      50: true,
                      100: "overflow",
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
      <Layer label="ak-layer-contrast-<number>" $flow="col">
        <Layer $stretch="overflow">
          <LayersContrast $flow="col">
            {(root) => (
              <Layer
                $flow="row"
                getVariants={(props) => ({
                  ...props,
                  $borderWidth: getFrom(root.$contrast, props.$borderWidth, {
                    10: 4,
                    20: 2,
                    30: 2,
                    40: 2,
                    70: 2,
                    80: 2,
                  }),
                  $stretch: getFrom(root.$contrast, props.$stretch, {
                    20: "overflow",
                    30: true,
                    70: true,
                    90: "overflow",
                  }),
                  $borderColor: getFrom(root.$contrast, props.$borderColor, {
                    10: "red",
                    20: "blueRel",
                    50: "blue",
                    70: "blueRel",
                    80: "blueRel",
                  }),
                })}
              >
                <LayersContrast
                  label={(props) => props.$contrast}
                  getVariants={(props) => ({
                    ...props,
                    $textLevel: getFrom(props.$contrast, props.$textLevel, {
                      20: 0,
                      70: 0,
                      100: 0,
                    }),
                    $stretch: getFrom(props.$contrast, props.$stretch, {
                      0: "overflow",
                      50: true,
                      100: "overflow",
                    }),
                    $m: getFrom(props.$contrast, props.$m, {
                      20: "-0.5",
                      80: "-2",
                    }),
                  })}
                />
              </Layer>
            )}
          </LayersContrast>
        </Layer>
      </Layer>
      <Layer label="ak-layer-blue" $flow="col">
        <Layer $stretch="overflow">
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
                      20: "overflow",
                      30: true,
                      70: true,
                      90: "overflow",
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
    </div>
  );
}
