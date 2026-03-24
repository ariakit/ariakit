import type { VariantProps } from "clava";
import { cv, splitProps } from "clava";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { useId } from "react";

const layer = cv({
  class: "ak-layer",
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
  },
});

const frame = cv({
  variants: {
    $frame: {
      false: "",
      true: "ak-frame",
    },
    $force: {
      false: "",
      true: "ak-frame-force",
    },
    $rounded: {
      false: "",
      none: "ak-frame-rounded-none",
      sm: "ak-frame-rounded-sm",
      md: "ak-frame-rounded-md",
      lg: "ak-frame-rounded-lg",
      xl: "ak-frame-rounded-xl",
      "2xl": "ak-frame-rounded-2xl",
      "3xl": "ak-frame-rounded-3xl",
      demo6: "ak-frame-[6px]",
    },
    $p: {
      false: "",
      0: "ak-frame-p-0",
      1: "ak-frame-p-1",
      2: "ak-frame-p-2",
      3: "ak-frame-p-3",
      4: "ak-frame-p-4",
      5: "ak-frame-p-5",
      6: "ak-frame-p-6",
      7: "ak-frame-p-7",
      8: "ak-frame-p-8",
      9: "ak-frame-p-9",
      10: "ak-frame-p-10",
      demo2: "ak-frame-p-[2px]",
    },
    $m: {
      false: "",
      demo2: "ak-frame-m-[2px]",
      negativeDemo2: "-ak-frame-m-[2px]",
    },
    $stretch: {
      false: "",
      cover: "ak-frame-cover",
      overflow: "ak-frame-overflow",
    },
    $flow: {
      false: "",
      row: "ak-frame-row",
      col: "ak-frame-col",
    },
    $edge: {
      false: "",
      start: "ak-frame-start",
      end: "ak-frame-end",
    },
    $border: {
      false: "",
      border: "ak-frame-border-(--border-width)",
      ring: "ak-frame-ring-(--border-width)",
      bordering: "ak-frame-bordering-(--border-width)",
    },
    $borderWidth: {
      false: "",
      0: "[--border-width:0px]",
      1: "[--border-width:1px]",
      2: "[--border-width:2px]",
      3: "[--border-width:3px]",
      4: "[--border-width:4px]",
    },
  },
  defaultVariants: {
    $frame: true,
    $force: false,
    $rounded: "2xl",
    $p: 1,
    $m: false,
    $stretch: false,
    $flow: false,
    $edge: false,
    $border: "bordering",
    $borderWidth: 1,
  },
});

const surface = cv({
  variants: {
    $surfaceText: {
      false: "",
      40: "ak-text-40",
      60: "ak-text-60",
      80: "ak-text-80",
    },
    $surfaceEdge: {
      false: "",
      10: "ak-edge-10",
      20: "ak-edge-20",
    },
    $surfaceEdgeTone: {
      false: "",
      contrast: "ak-edge-contrast-20",
      red: "ak-edge-red-500",
      cool: "ak-edge-cool-20",
      warm: "ak-edge-warm-20",
    },
    $surfaceOutline: {
      false: "",
      true: "ak-outline outline-2 outline-offset-2",
    },
    $surfaceOutlineTone: {
      false: "",
      20: "ak-outline-20",
      red: "ak-outline-red-500",
      warm: "ak-outline-warm-20",
    },
  },
});

const textSample = cv({
  class: "ak-text inline-flex font-normal",
  variants: {
    $textLevel: {
      false: "",
      10: "ak-text-10",
      40: "ak-text-40",
      80: "ak-text-80",
    },
    $textTone: {
      false: "",
      layer: "ak-text-layer",
      red: "ak-text-red-500",
    },
    $textLightness: {
      false: "",
      lighten: "ak-text-lighten-20",
      darken: "ak-text-darken-20",
    },
    $textTemperature: {
      false: "",
      cool: "ak-text-cool-20",
      warm: "ak-text-warm-20",
    },
    $textChroma: {
      false: "",
      saturate: "ak-text-saturate-20",
      desaturate: "ak-text-desaturate-20",
    },
    $textLimits: {
      false: "",
      band: "ak-text-min-20 ak-text-max-80",
    },
  },
});

const layerSurfaceFrame = cv({ extend: [layer, frame, surface] });

interface TitleSampleProps extends VariantProps<typeof textSample> {
  label: string;
}

interface LayerProps
  extends ComponentProps<"section">, VariantProps<typeof layerSurfaceFrame> {
  childrenFrameClassName?: string;
  childrenFrameProps?: VariantProps<typeof frame>;
  orientation?: "vertical" | "horizontal";
  titleSamples?: TitleSampleProps[];
}

interface LayersProps extends Omit<LayerProps, "$layer"> {
  demo?: boolean;
  maxLevel?: number;
}

function TitleSample({ label, ...props }: TitleSampleProps) {
  return <span {...textSample.jsx(props)}>{label}</span>;
}

function Layer({
  className,
  title,
  children,
  childrenFrameClassName,
  childrenFrameProps,
  orientation = "horizontal",
  titleSamples,
  ...props
}: LayerProps) {
  const id = useId();
  const [layerProps, rest] = splitProps(props, layerSurfaceFrame);
  if (title == null) {
    const entry = Object.entries(layerProps).find(([key, value]) => {
      if (!layer.variantKeys.some((variantKey) => variantKey === key)) {
        return false;
      }
      return typeof value === "number";
    });
    const value = entry?.[1];
    if (typeof value === "number") {
      title = String(value);
    }
  }
  return (
    <section
      aria-labelledby={id}
      {...rest}
      {...layerSurfaceFrame.jsx({
        ...layerProps,
        class: clsx("font-mono flex gap-1 flex-col", className),
      })}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span id={id}>{title}</span>
        {titleSamples?.map((sample) => (
          <TitleSample key={sample.label} {...sample} />
        ))}
      </div>
      {children && (
        <div
          {...frame.jsx({
            $frame: true,
            $rounded: "2xl",
            $p: 1,
            $border: "bordering",
            $borderWidth: 1,
            ...childrenFrameProps,
            class: clsx(
              "ak-layer flex flex-wrap gap-[inherit]",
              orientation === "vertical" ? "flex-col" : "flex-row",
              childrenFrameClassName,
            ),
          })}
        >
          {children}
        </div>
      )}
    </section>
  );
}

function FrameLeaf({ title = "20" }: { title?: string }) {
  return (
    <Layer
      title={title}
      $layer={20}
      $frame={true}
      $rounded={false}
      $p={false}
      $border={false}
      className="min-h-24 min-w-40"
    />
  );
}

function Layers({
  demo = false,
  maxLevel = 100,
  children,
  ...props
}: LayersProps) {
  return (
    <>
      {maxLevel >= 0 && (
        <Layer
          {...props}
          $layer={0}
          title={demo ? "0 frame-cover" : undefined}
          $rounded={demo ? "demo6" : props.$rounded}
          $p={demo ? "demo2" : props.$p}
          $border={demo ? false : props.$border}
          $surfaceText={demo ? 60 : props.$surfaceText}
          titleSamples={
            demo
              ? [{ label: "text plain" }, { label: "text 10", $textLevel: 10 }]
              : props.titleSamples
          }
          childrenFrameProps={
            demo
              ? {
                  $rounded: false,
                  $p: false,
                  $border: false,
                  $stretch: "cover",
                }
              : props.childrenFrameProps
          }
        >
          {demo ? <FrameLeaf /> : children}
        </Layer>
      )}
      {maxLevel >= 10 && (
        <Layer
          {...props}
          $layer={10}
          title={demo ? "10 frame-overflow border" : undefined}
          $rounded={demo ? "demo6" : props.$rounded}
          $p={demo ? "demo2" : props.$p}
          $border={demo ? "border" : props.$border}
          $borderWidth={demo ? 1 : props.$borderWidth}
          childrenFrameProps={
            demo
              ? {
                  $rounded: false,
                  $p: false,
                  $border: false,
                  $stretch: "overflow",
                }
              : props.childrenFrameProps
          }
        >
          {demo ? <FrameLeaf /> : children}
        </Layer>
      )}
      {maxLevel >= 20 && (
        <Layer
          {...props}
          $layer={20}
          title={demo ? "20 frame-overflow bordering" : undefined}
          $rounded={demo ? "demo6" : props.$rounded}
          $p={demo ? "demo2" : props.$p}
          $border={demo ? "bordering" : props.$border}
          $borderWidth={demo ? 1 : props.$borderWidth}
          $surfaceEdge={demo ? 10 : props.$surfaceEdge}
          $surfaceEdgeTone={demo ? "contrast" : props.$surfaceEdgeTone}
          childrenFrameProps={
            demo
              ? {
                  $rounded: false,
                  $p: false,
                  $border: "bordering",
                  $borderWidth: 1,
                  $stretch: "overflow",
                }
              : props.childrenFrameProps
          }
        >
          {demo ? <FrameLeaf /> : children}
        </Layer>
      )}
      {maxLevel >= 30 && (
        <Layer
          {...props}
          $layer={30}
          title={demo ? "30 frame-m" : undefined}
          $rounded={demo ? "demo6" : props.$rounded}
          $p={demo ? "demo2" : props.$p}
          $border={demo ? false : props.$border}
          titleSamples={
            demo
              ? [{ label: "text limits", $textLimits: "band" }]
              : props.titleSamples
          }
          childrenFrameProps={
            demo
              ? {
                  $rounded: "demo6",
                  $p: "demo2",
                  $m: "negativeDemo2",
                  $border: false,
                }
              : props.childrenFrameProps
          }
        >
          {demo ? <FrameLeaf /> : children}
        </Layer>
      )}
      {maxLevel >= 40 && (
        <Layer
          {...props}
          $layer={40}
          title={demo ? "40 frame-ring outline-20" : undefined}
          $rounded={demo ? "demo6" : props.$rounded}
          $p={demo ? "demo2" : props.$p}
          $border={demo ? "ring" : props.$border}
          $borderWidth={demo ? 2 : props.$borderWidth}
          $surfaceOutline={demo ? true : props.$surfaceOutline}
          $surfaceOutlineTone={demo ? 20 : props.$surfaceOutlineTone}
          titleSamples={
            demo
              ? [{ label: "text lighten", $textLightness: "lighten" }]
              : props.titleSamples
          }
        >
          {children}
        </Layer>
      )}
      {maxLevel >= 50 && (
        <Layer
          {...props}
          $layer={50}
          title={demo ? "50 frame-rounded-none" : undefined}
          $rounded={demo ? "none" : props.$rounded}
          $p={demo ? "demo2" : props.$p}
          $border={demo ? "bordering" : props.$border}
          titleSamples={
            demo
              ? [
                  { label: "text plain" },
                  { label: "text red 40", $textTone: "red", $textLevel: 40 },
                  { label: "text darken", $textLightness: "darken" },
                ]
              : props.titleSamples
          }
        >
          {children}
        </Layer>
      )}
      {maxLevel >= 60 && (
        <Layer
          {...props}
          $layer={60}
          title={demo ? "60 frame-cover row start" : undefined}
          childrenFrameProps={
            demo
              ? {
                  $rounded: "demo6",
                  $p: "demo2",
                  $border: false,
                }
              : props.childrenFrameProps
          }
        >
          {demo ? (
            <>
              <Layer
                title="cover row start before"
                $layer={10}
                $rounded={false}
                $p={false}
                $border={false}
                className="min-h-24 min-w-24"
              />
              <Layer
                title="cover row start target"
                $layer={20}
                $stretch="cover"
                $flow="row"
                $edge="start"
                $rounded={false}
                $p={false}
                $border={false}
                className="min-h-24 min-w-40"
              />
              <Layer
                title="cover row start after"
                $layer={30}
                $rounded={false}
                $p={false}
                $border={false}
                className="min-h-24 min-w-24"
              />
            </>
          ) : (
            children
          )}
        </Layer>
      )}
      {maxLevel >= 70 && (
        <Layer
          {...props}
          $layer={70}
          title={demo ? "70 frame-overflow col end" : undefined}
          orientation={demo ? "vertical" : props.orientation}
          childrenFrameProps={
            demo
              ? {
                  $rounded: "demo6",
                  $p: "demo2",
                  $border: "border",
                  $borderWidth: 1,
                }
              : props.childrenFrameProps
          }
        >
          {demo ? (
            <>
              <Layer
                title="overflow col end before"
                $layer={10}
                $rounded={false}
                $p={false}
                $border={false}
                className="min-h-24 min-w-40"
              />
              <Layer
                title="overflow col end target"
                $layer={20}
                $stretch="overflow"
                $flow="col"
                $edge="end"
                $rounded={false}
                $p={false}
                $border={false}
                className="min-h-24 min-w-40"
              />
              <Layer
                title="overflow col end after"
                $layer={30}
                $rounded={false}
                $p={false}
                $border={false}
                className="min-h-24 min-w-40"
              />
            </>
          ) : (
            children
          )}
        </Layer>
      )}
      {maxLevel >= 80 && (
        <Layer
          {...props}
          $layer={80}
          title={demo ? "80 edge-contrast" : undefined}
          $surfaceEdge={demo ? 20 : props.$surfaceEdge}
          $surfaceEdgeTone={demo ? "contrast" : props.$surfaceEdgeTone}
        >
          {children}
        </Layer>
      )}
      {maxLevel >= 90 && (
        <Layer
          {...props}
          $layer={90}
          title={demo ? "90 frame-border-2" : undefined}
          $rounded={demo ? "demo6" : props.$rounded}
          $p={demo ? "demo2" : props.$p}
          $border={demo ? "border" : props.$border}
          $borderWidth={demo ? 2 : props.$borderWidth}
        >
          {children}
        </Layer>
      )}
      {maxLevel >= 100 && (
        <Layer
          {...props}
          $layer={100}
          title={demo ? "100 frame-m-2" : undefined}
          $surfaceText={demo ? 40 : props.$surfaceText}
          childrenFrameProps={demo ? { $m: "demo2" } : props.childrenFrameProps}
        >
          {children}
        </Layer>
      )}
    </>
  );
}

function LayersState({ maxLevel = 100, ...props }: LayersProps) {
  return (
    <>
      {maxLevel >= 0 && <Layer {...props} $layerState={0} />}
      {maxLevel >= 10 && <Layer {...props} $layerState={10} />}
      {maxLevel >= 20 && <Layer {...props} $layerState={20} />}
      {maxLevel >= 30 && <Layer {...props} $layerState={30} />}
      {maxLevel >= 40 && <Layer {...props} $layerState={40} />}
      {maxLevel >= 50 && <Layer {...props} $layerState={50} />}
      {maxLevel >= 60 && <Layer {...props} $layerState={60} />}
      {maxLevel >= 70 && <Layer {...props} $layerState={70} />}
      {maxLevel >= 80 && <Layer {...props} $layerState={80} />}
      {maxLevel >= 90 && <Layer {...props} $layerState={90} />}
      {maxLevel >= 100 && <Layer {...props} $layerState={100} />}
    </>
  );
}

function LayersContrast({ maxLevel = 100, children, ...props }: LayersProps) {
  return (
    <>
      {maxLevel >= 0 && (
        <Layer {...props} $contrast={0}>
          {children}
        </Layer>
      )}
      {maxLevel >= 10 && (
        <Layer {...props} $contrast={10}>
          {children}
        </Layer>
      )}
      {maxLevel >= 20 && (
        <Layer {...props} $contrast={20}>
          {children}
        </Layer>
      )}
      {maxLevel >= 30 && (
        <Layer {...props} $contrast={30}>
          {children}
        </Layer>
      )}
      {maxLevel >= 40 && (
        <Layer {...props} $contrast={40}>
          {children}
        </Layer>
      )}
      {maxLevel >= 50 && (
        <Layer {...props} $contrast={50}>
          {children}
        </Layer>
      )}
      {maxLevel >= 60 && (
        <Layer {...props} $contrast={60}>
          {children}
        </Layer>
      )}
      {maxLevel >= 70 && (
        <Layer {...props} $contrast={70}>
          {children}
        </Layer>
      )}
      {maxLevel >= 80 && (
        <Layer {...props} $contrast={80}>
          {children}
        </Layer>
      )}
      {maxLevel >= 90 && (
        <Layer {...props} $contrast={90}>
          {children}
        </Layer>
      )}
      {maxLevel >= 100 && (
        <Layer {...props} $contrast={100}>
          {children}
        </Layer>
      )}
    </>
  );
}

function LayersMix({ maxLevel = 100, children, ...props }: LayersProps) {
  return (
    <>
      {maxLevel >= 0 && (
        <Layer {...props} $mix={0} $mixColor="red">
          {children}
        </Layer>
      )}
      {maxLevel >= 10 && (
        <Layer {...props} $mix={10} $mixColor="red">
          {children}
        </Layer>
      )}
      {maxLevel >= 20 && (
        <Layer {...props} $mix={20} $mixColor="red">
          {children}
        </Layer>
      )}
      {maxLevel >= 30 && (
        <Layer {...props} $mix={30} $mixColor="red">
          {children}
        </Layer>
      )}
      {maxLevel >= 40 && (
        <Layer {...props} $mix={40} $mixColor="red">
          {children}
        </Layer>
      )}
      {maxLevel >= 50 && (
        <Layer {...props} $mix={50} $mixColor="red">
          {children}
        </Layer>
      )}
      {maxLevel >= 60 && (
        <Layer {...props} $mix={60} $mixColor="red">
          {children}
        </Layer>
      )}
      {maxLevel >= 70 && (
        <Layer {...props} $mix={70} $mixColor="red">
          {children}
        </Layer>
      )}
      {maxLevel >= 80 && (
        <Layer {...props} $mix={80} $mixColor="red">
          {children}
        </Layer>
      )}
      {maxLevel >= 90 && (
        <Layer {...props} $mix={90} $mixColor="red">
          {children}
        </Layer>
      )}
      {maxLevel >= 100 && (
        <Layer {...props} $mix={100} $mixColor="red">
          {children}
        </Layer>
      )}
    </>
  );
}

function LayersLighten({ maxLevel = 100, children, ...props }: LayersProps) {
  return (
    <>
      {maxLevel >= 0 && (
        <Layer {...props} $lighten={0}>
          {children}
        </Layer>
      )}
      {maxLevel >= 10 && (
        <Layer {...props} $lighten={10}>
          {children}
        </Layer>
      )}
      {maxLevel >= 20 && (
        <Layer {...props} $lighten={20}>
          {children}
        </Layer>
      )}
      {maxLevel >= 30 && (
        <Layer {...props} $lighten={30}>
          {children}
        </Layer>
      )}
      {maxLevel >= 40 && (
        <Layer {...props} $lighten={40}>
          {children}
        </Layer>
      )}
      {maxLevel >= 50 && (
        <Layer {...props} $lighten={50}>
          {children}
        </Layer>
      )}
      {maxLevel >= 60 && (
        <Layer {...props} $lighten={60}>
          {children}
        </Layer>
      )}
      {maxLevel >= 70 && (
        <Layer {...props} $lighten={70}>
          {children}
        </Layer>
      )}
      {maxLevel >= 80 && (
        <Layer {...props} $lighten={80}>
          {children}
        </Layer>
      )}
      {maxLevel >= 90 && (
        <Layer {...props} $lighten={90}>
          {children}
        </Layer>
      )}
      {maxLevel >= 100 && (
        <Layer {...props} $lighten={100}>
          {children}
        </Layer>
      )}
    </>
  );
}

function LayersDarken({ maxLevel = 100, children, ...props }: LayersProps) {
  return (
    <>
      {maxLevel >= 0 && (
        <Layer {...props} $darken={0}>
          {children}
        </Layer>
      )}
      {maxLevel >= 10 && (
        <Layer {...props} $darken={10}>
          {children}
        </Layer>
      )}
      {maxLevel >= 20 && (
        <Layer {...props} $darken={20}>
          {children}
        </Layer>
      )}
      {maxLevel >= 30 && (
        <Layer {...props} $darken={30}>
          {children}
        </Layer>
      )}
      {maxLevel >= 40 && (
        <Layer {...props} $darken={40}>
          {children}
        </Layer>
      )}
      {maxLevel >= 50 && (
        <Layer {...props} $darken={50}>
          {children}
        </Layer>
      )}
      {maxLevel >= 60 && (
        <Layer {...props} $darken={60}>
          {children}
        </Layer>
      )}
      {maxLevel >= 70 && (
        <Layer {...props} $darken={70}>
          {children}
        </Layer>
      )}
      {maxLevel >= 80 && (
        <Layer {...props} $darken={80}>
          {children}
        </Layer>
      )}
      {maxLevel >= 90 && (
        <Layer {...props} $darken={90}>
          {children}
        </Layer>
      )}
      {maxLevel >= 100 && (
        <Layer {...props} $darken={100}>
          {children}
        </Layer>
      )}
    </>
  );
}

function BrandLayers({
  children,
  ...props
}: Omit<LayersProps, "demo" | "maxLevel">) {
  return (
    <>
      <Layer
        {...props}
        $layer={0}
        title="brand 0 text color"
        titleSamples={[
          { label: "text plain" },
          { label: "text red", $textTone: "red" },
          { label: "text layer", $textTone: "layer" },
        ]}
      >
        {children}
      </Layer>
      <Layer
        {...props}
        $layer={10}
        title="brand 10 border tone outline red"
        $surfaceEdge={20}
        $surfaceEdgeTone="red"
        $surfaceOutline={true}
        $surfaceOutlineTone="red"
      >
        {children}
      </Layer>
      <Layer
        {...props}
        $layer={20}
        title="brand 20 text cool border tone cool"
        $surfaceEdge={20}
        $surfaceEdgeTone="cool"
        titleSamples={[{ label: "text cool", $textTemperature: "cool" }]}
      >
        {children}
      </Layer>
      <Layer
        {...props}
        $layer={30}
        title="brand 30 text warm outline warm"
        $surfaceOutline={true}
        $surfaceOutlineTone="warm"
        titleSamples={[{ label: "text warm", $textTemperature: "warm" }]}
      >
        {children}
      </Layer>
      <Layer
        {...props}
        $layer={40}
        title="brand 40 text chroma"
        titleSamples={[
          {
            label: "text saturate",
            $textChroma: "saturate",
          },
          {
            label: "text desaturate",
            $textChroma: "desaturate",
          },
        ]}
      >
        {children}
      </Layer>
      <Layer
        {...props}
        $layer={50}
        title="brand 50 text limits"
        titleSamples={[
          {
            label: "text limits",
            $textLimits: "band",
          },
        ]}
      >
        {children}
      </Layer>
    </>
  );
}

export default function Example() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Layer title="ak-layer-<number>">
        <Layers demo>
          <Layers />
        </Layers>
      </Layer>
      <Layer title="ak-state-<number>">
        <LayersState>
          <LayersState />
        </LayersState>
      </Layer>
      <Layer title="ak-layer-contrast-<number>">
        <LayersContrast>
          <LayersContrast />
        </LayersContrast>
      </Layer>
      <Layer title="ak-layer-mix-<number>">
        <LayersMix>
          <LayersMix />
        </LayersMix>
      </Layer>
      <Layer title="ak-layer-brand">
        <Layers maxLevel={50} className="ak-layer-brand" orientation="vertical">
          <Layer title="ak-layer-<number>">
            <BrandLayers>
              <Layers />
            </BrandLayers>
          </Layer>
          <Layer title="ak-state-<number>">
            <LayersState />
          </Layer>
          <Layer title="ak-layer-contrast-<number>">
            <LayersContrast />
          </Layer>
          <Layer title="ak-layer-mix-<number>">
            <LayersMix />
          </Layer>
          <Layer title="ak-layer-lighten-<number>">
            <LayersLighten />
          </Layer>
          <Layer title="ak-layer-darken-<number>">
            <LayersDarken />
          </Layer>
          <Layer
            title="ak-layer-complementary"
            className="ak-layer-complementary"
            orientation="vertical"
          >
            <Layer title="ak-layer-<number>">
              <Layers />
            </Layer>
            <Layer title="ak-state-<number>">
              <LayersState />
            </Layer>
            <Layer title="ak-layer-mix-<number>">
              <LayersMix />
            </Layer>
            <Layer title="ak-layer-contrast-<number>">
              <LayersContrast />
            </Layer>
            <Layer title="ak-layer-lighten-<number>">
              <LayersLighten />
            </Layer>
            <Layer title="ak-layer-darken-<number>">
              <LayersDarken />
            </Layer>
          </Layer>
        </Layers>
      </Layer>
    </div>
  );
}
