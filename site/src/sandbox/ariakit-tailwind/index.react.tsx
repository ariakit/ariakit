import type { VariantProps } from "clava";
import { cv, splitProps } from "clava";
import clsx from "clsx";
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
    $state: {
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

interface LayerProps
  extends ComponentProps<"section">,
    VariantProps<typeof layer> {
  orientation?: "vertical" | "horizontal";
}

function Layer({
  title,
  children,
  orientation = "horizontal",
  ...props
}: LayerProps) {
  const id = useId();
  const [layerProps, rest] = splitProps(props, layer);
  title ??= Object.values(layerProps)
    .find((value) => typeof value === "number")
    ?.toString();
  return (
    <section
      aria-labelledby={id}
      {...rest}
      {...layer.jsx({
        ...layerProps,
        class:
          "ak-frame ak-frame-2xl/1 ak-edge-20 ak-frame-bordering font-mono flex gap-1 flex-col",
      })}
    >
      <div id={id}>{title}</div>
      {children && (
        <div
          className={clsx(
            "ak-layer ak-frame ak-frame-p-1 ak-frame-bordering ak-frame-overflow flex flex-wrap gap-[inherit]",
            orientation === "vertical" ? "flex-col" : "flex-row",
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}

interface LayersProps extends LayerProps {
  maxLevel?: number;
}

function Layers({ maxLevel = 100, ...props }: LayersProps) {
  return (
    <>
      <Layer {...props} $layer={0} />
      <Layer {...props} $layer={10} />
      <Layer {...props} $layer={20} />
      <Layer {...props} $layer={30} />
      <Layer {...props} $layer={40} />
      <Layer {...props} $layer={50} />
      {maxLevel >= 60 && <Layer {...props} $layer={60} />}
      {maxLevel >= 70 && <Layer {...props} $layer={70} />}
      {maxLevel >= 80 && <Layer {...props} $layer={80} />}
      {maxLevel >= 90 && <Layer {...props} $layer={90} />}
      {maxLevel >= 100 && <Layer {...props} $layer={100} />}
    </>
  );
}

function LayersState(props: LayerProps) {
  return (
    <>
      <Layer {...props} $state={0} />
      <Layer {...props} $state={10} />
      <Layer {...props} $state={20} />
      <Layer {...props} $state={30} />
      <Layer {...props} $state={40} />
      <Layer {...props} $state={50} />
      <Layer {...props} $state={60} />
      <Layer {...props} $state={70} />
      <Layer {...props} $state={80} />
      <Layer {...props} $state={90} />
      <Layer {...props} $state={100} />
    </>
  );
}

function LayersContrast(props: LayerProps) {
  return (
    <>
      <Layer {...props} $contrast={0} />
      <Layer {...props} $contrast={10} />
      <Layer {...props} $contrast={20} />
      <Layer {...props} $contrast={30} />
      <Layer {...props} $contrast={40} />
      <Layer {...props} $contrast={50} />
      <Layer {...props} $contrast={60} />
      <Layer {...props} $contrast={70} />
      <Layer {...props} $contrast={80} />
      <Layer {...props} $contrast={90} />
      <Layer {...props} $contrast={100} />
    </>
  );
}

function LayersMix(props: LayerProps) {
  return (
    <>
      <Layer {...props} $mixColor="red" $mix={0} />
      <Layer {...props} $mixColor="red" $mix={10} />
      <Layer {...props} $mixColor="red" $mix={20} />
      <Layer {...props} $mixColor="red" $mix={30} />
      <Layer {...props} $mixColor="red" $mix={40} />
      <Layer {...props} $mixColor="red" $mix={50} />
      <Layer {...props} $mixColor="red" $mix={60} />
      <Layer {...props} $mixColor="red" $mix={70} />
      <Layer {...props} $mixColor="red" $mix={80} />
      <Layer {...props} $mixColor="red" $mix={90} />
      <Layer {...props} $mixColor="red" $mix={100} />
    </>
  );
}

function LayersLighten(props: LayerProps) {
  return (
    <>
      <Layer {...props} $lighten={0} />
      <Layer {...props} $lighten={10} />
      <Layer {...props} $lighten={20} />
      <Layer {...props} $lighten={30} />
      <Layer {...props} $lighten={40} />
      <Layer {...props} $lighten={50} />
      <Layer {...props} $lighten={60} />
      <Layer {...props} $lighten={70} />
      <Layer {...props} $lighten={80} />
      <Layer {...props} $lighten={90} />
      <Layer {...props} $lighten={100} />
    </>
  );
}

function LayersDarken(props: LayerProps) {
  return (
    <>
      <Layer {...props} $darken={0} />
      <Layer {...props} $darken={10} />
      <Layer {...props} $darken={20} />
      <Layer {...props} $darken={30} />
      <Layer {...props} $darken={40} />
      <Layer {...props} $darken={50} />
      <Layer {...props} $darken={60} />
      <Layer {...props} $darken={70} />
      <Layer {...props} $darken={80} />
      <Layer {...props} $darken={90} />
      <Layer {...props} $darken={100} />
    </>
  );
}

export default function Example() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Layer title="ak-layer-<number>">
        <Layers>
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
      <Layer title="ak-layer-black" className="ak-layer-black">
        <Layer title="ak-layer-lighten-<number>">
          <LayersLighten>
            <LayersLighten />
          </LayersLighten>
        </Layer>
      </Layer>
      <Layer title="ak-layer-white" className="ak-layer-white">
        <Layer title="ak-layer-darken-<number>">
          <LayersDarken>
            <LayersDarken />
          </LayersDarken>
        </Layer>
      </Layer>

      <Layer title="ak-layer-brand">
        <Layers maxLevel={50} className="ak-layer-brand" orientation="vertical">
          <Layer title="ak-layer-<number>">
            <Layers />
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
