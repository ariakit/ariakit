import "./style.css";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";

interface LayerProps extends ComponentProps<"section"> {
  label?: ReactNode;
}

function Layer({ label, children, ...props }: LayerProps) {
  const id = useId();
  label =
    label ??
    (children
      ? /ak-(?:layer|state)-\S+/.exec(props.className ?? "")?.[0]
      : (/ak-(?:layer|state)[a-z-]*-(\d+)/.exec(props.className ?? "")?.[1] ??
        /ak-(?:layer|state)-([\w-[\]#]+)/.exec(props.className ?? "")?.[1] ??
        /ak-text[a-z-]*-(\d+)/.exec(props.className ?? "")?.[1]));
  return (
    <section
      aria-labelledby={label ? id : undefined}
      {...props}
      className={clsx(
        "flex font-mono gap-(--ak-frame-padding)",
        props.className,
      )}
    >
      {label != null && <div id={id}>{label}</div>}
      {children}
    </section>
  );
}

interface CellProps extends LayerProps {}

function Cell(props: CellProps) {
  return (
    <Layer
      {...props}
      className={clsx(
        "ak-layer ak-frame ak-frame-p-1 ak-frame-border",
        props.className,
      )}
    />
  );
}

function Layers() {
  return (
    <>
      <Layer
        label="ak-text-l-<number>"
        className="ak-layer ak-frame ak-frame-p-1 ak-frame-border flex-col"
      >
        <Layer className="flex-wrap items-start">
          <Cell className="*:ak-text *:ak-text-l-0" />
          <Cell className="*:ak-text *:ak-text-l-10" />
          <Cell className="*:ak-text *:ak-text-l-20" />
          <Cell className="*:ak-text *:ak-text-l-30" />
          <Cell className="*:ak-text *:ak-text-l-40" />
          <Cell className="*:ak-text *:ak-text-l-50" />
          <Cell className="*:ak-text *:ak-text-l-60" />
          <Cell className="*:ak-text *:ak-text-l-70" />
          <Cell className="*:ak-text *:ak-text-l-80" />
          <Cell className="*:ak-text *:ak-text-l-90" />
          <Cell className="*:ak-text *:ak-text-l-100" />
        </Layer>
      </Layer>
      <Layer
        label="ak-text-<number>"
        className="ak-layer ak-frame ak-frame-p-1 ak-frame-border flex-col"
      >
        <Layer className="flex-wrap items-start">
          <Cell className="*:ak-text *:ak-text-0" />
          <Cell className="*:ak-text *:ak-text-10" />
          <Cell className="*:ak-text *:ak-text-20" />
          <Cell className="*:ak-text *:ak-text-30" />
          <Cell className="*:ak-text *:ak-text-40" />
          <Cell className="*:ak-text *:ak-text-50" />
          <Cell className="*:ak-text *:ak-text-60" />
          <Cell className="*:ak-text *:ak-text-70" />
          <Cell className="*:ak-text *:ak-text-80" />
          <Cell className="*:ak-text *:ak-text-90" />
          <Cell className="*:ak-text *:ak-text-100" />
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-<number>"
        className="ak-layer ak-frame ak-frame-cover ak-frame-border flex-col"
      >
        <Layer className="ak-layer ak-frame ak-frame-cover ak-frame-border ak-frame-row">
          <Cell className="ak-layer-0 *:ak-text *:ak-text-red-600" />
          <Cell className="ak-layer-10 *:ak-text *:ak-text-green-600" />
          <Cell className="ak-layer-20 *:ak-text *:ak-text-blue-600" />
          <Cell className="ak-layer-30 *:ak-text *:ak-text-pink-600" />
          <Cell className="ak-layer-40 *:ak-text *:ak-text-blue-600 *:ak-text-complementary" />
          <Cell className="ak-layer-50 ak-ink-0" />
          <Cell className="ak-layer-60" />
          <Cell className="ak-layer-70" />
          <Cell className="ak-layer-80" />
          <Cell className="ak-layer-90" />
          <Cell className="ak-layer-100" />
        </Layer>
      </Layer>
      <Layer
        label="ak-state-<number>"
        className="ak-layer ak-frame ak-frame-cover ak-frame-border flex-col"
      >
        <Layer className="ak-layer ak-frame ak-frame-cover ak-frame-border ak-frame-row">
          <Cell className="ak-state-0 *:ak-text *:ak-text-red-600" />
          <Cell className="ak-state-10 *:ak-text *:ak-text-green-600" />
          <Cell className="ak-state-20 *:ak-text *:ak-text-blue-600" />
          <Cell className="ak-state-30 *:ak-text *:ak-text-pink-600" />
          <Cell className="ak-state-40 *:ak-text *:ak-text-blue-600 *:ak-text-complementary" />
          <Cell className="ak-state-50 ak-ink-0" />
          <Cell className="ak-state-60" />
          <Cell className="ak-state-70" />
          <Cell className="ak-state-80" />
          <Cell className="ak-state-90" />
          <Cell className="ak-state-100" />
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-invert"
        className="ak-layer ak-layer-invert ak-frame ak-frame-full/1 ak-frame-force ak-frame-border ak-edge-min-c-30 ak-edge-raw *:ak-text"
      />
      <Layer
        label="ak-layer-darken-<number>"
        className="ak-layer ak-layer-min-70 ak-frame ak-frame-cover ak-frame-border flex-col border-t-0"
      >
        <Layer className="ak-layer ak-frame ak-frame-cover ak-frame-border ak-frame-row">
          <Layer className="ak-layer ak-layer-darken-0 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-darken-10 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-darken-20 ak-frame ak-frame-p-1 ak-frame-bordering-4 ak-edge-lighten-100 ak-edge-50" />
          <Layer className="ak-layer ak-layer-darken-30 ak-frame ak-frame-p-1 ak-frame-bordering ak-edge-saturate-60 ak-edge-raw" />
          <Layer className="ak-layer ak-layer-darken-40 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-darken-50 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-darken-60 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-darken-70 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-darken-80 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-darken-90 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-darken-100 ak-frame ak-frame-p-1 ak-frame-bordering" />
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-lighten-<number>"
        className="ak-layer ak-layer-max-30 ak-frame ak-frame-ring-2 ak-frame-p-1 flex-col ak-edge-blue-600 ak-edge-20"
      >
        <Layer className="ak-layer ak-frame ak-frame-cover ak-frame-border-4 ak-frame-row ak-edge-blue ak-edge-vivid ak-edge-raw ak-edge-push-30">
          <Layer className="ak-layer ak-layer-lighten-0 ak-frame ak-frame-p-1 ak-frame-ring ak-frame-cover ak-edge-40" />
          <Layer className="ak-layer ak-layer-lighten-10 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-lighten-20 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-lighten-30 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-lighten-40 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-lighten-50 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-lighten-60 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-lighten-70 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-lighten-80 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-lighten-90 ak-frame ak-frame-p-1 ak-frame-bordering" />
          <Layer className="ak-layer ak-layer-lighten-100 ak-frame ak-frame-p-1 ak-frame-bordering ak-frame-m-1" />
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-push-<number>"
        className="ak-layer ak-frame ak-frame-p-1 -ak-frame-m-2 ak-frame-border-4 flex-col my-0"
      >
        <Layer className="ak-layer ak-frame ak-frame-p-1 ak-frame-ring ak-frame-row ak-edge-blue-600 ak-edge-raw">
          <Layer className="ak-layer ak-layer-push-0 ak-frame ak-frame-p-1 ak-frame-ring ak-frame-cover ak-frame-m-1 ak-edge-20" />
          <Cell className="ak-layer-push-10 *:ak-text *:ak-text-blue-200" />
          <Cell className="ak-layer-push-20 *:ak-text *:ak-text-warm-50 *:ak-text-saturate-40" />
          <Cell className="ak-layer-push-30 *:ak-text *:ak-text-lighten-80" />
          <Cell className="ak-layer-push-40 *:ak-text *:ak-text-darken-80" />
          <Cell className="ak-layer-push-50" />
          <Cell className="ak-layer-push-60" />
          <Cell className="ak-layer-push-70" />
          <Cell className="ak-layer-push-80" />
          <Cell className="ak-layer-push-90" />
          <Cell className="ak-layer-push-100" />
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-contrast-<number>"
        className="ak-layer ak-frame ak-frame-cover ak-frame-border flex-col"
      >
        <Layer className="ak-layer ak-frame ak-frame-cover ak-frame-border ak-frame-row">
          <Cell className="ak-layer-contrast ak-layer-contrast-0 ak-layer-blue-600" />
          <Cell className="ak-layer-contrast ak-layer-contrast-10 ak-layer-blue-600" />
          <Cell className="ak-layer-contrast ak-layer-contrast-20 ak-layer-blue-600" />
          <Cell className="ak-layer-contrast ak-layer-contrast-30 ak-layer-blue-600" />
          <Cell className="ak-layer-contrast ak-layer-contrast-40 ak-layer-blue-600 *:ak-text" />
          <Cell className="ak-layer-contrast ak-layer-contrast-50 ak-layer-blue-600" />
          <Cell className="ak-layer-contrast ak-layer-contrast-60 ak-layer-blue-600" />
          <Cell className="ak-layer-contrast ak-layer-contrast-70 ak-layer-blue-600" />
          <Cell className="ak-layer-contrast ak-layer-contrast-80 ak-layer-blue-600" />
          <Cell className="ak-layer-contrast ak-layer-contrast-90 ak-layer-blue-600" />
          <Cell className="ak-layer-contrast ak-layer-contrast-100 ak-layer-blue-600" />
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-mix-<number>"
        className="ak-layer ak-frame ak-frame-cover ak-frame-border flex-col"
      >
        <Layer className="ak-layer ak-frame ak-frame-cover ak-frame-border ak-frame-row">
          <Cell className="ak-layer-mix-0 ak-layer-orange-600" />
          <Cell className="ak-layer-mix-10 ak-layer-orange-600 *:ak-text *:ak-text-h-yellow *:ak-text-neon *:ak-text-max-c-balanced" />
          <Cell className="ak-layer-mix-20 ak-layer-orange-600 *:ak-text *:ak-text-neon" />
          <Cell className="ak-layer-mix-30 ak-layer-orange-600 *:ak-text *:ak-text-desaturate-20" />
          <Cell className="ak-layer-mix-40 ak-layer-orange-600 *:ak-text *:ak-text-cool-50" />
          <Cell className="ak-layer-mix-50 ak-layer-orange-600" />
          <Cell className="ak-layer-mix-60 ak-layer-orange-600" />
          <Cell className="ak-layer-mix-70 ak-layer-orange-600" />
          <Cell className="ak-layer-mix-80 ak-layer-orange-600" />
          <Cell className="ak-layer-mix-90 ak-layer-orange-600" />
          <Cell className="ak-layer-mix-100 ak-layer-orange-600" />
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-saturate-<number>"
        className="ak-layer ak-frame ak-frame-2xl/1 ak-frame-m-4 ak-frame-border flex-col"
      >
        <Layer className="ak-layer ak-frame ak-frame-cover ak-frame-border ak-frame-row">
          <Cell className="ak-layer-saturate-0" />
          <Cell className="ak-layer-saturate-10" />
          <Cell className="ak-layer-saturate-20" />
          <Cell className="ak-layer-saturate-30" />
          <Cell className="ak-layer-saturate-40" />
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-desaturate-<number>"
        className="ak-layer ak-frame ak-frame-cover ak-frame-border flex-col ak-layer-c-40 ak-edge-red ak-edge-raw ak-frame-start ak-frame-end z-1"
      >
        <Layer className="ak-layer ak-frame ak-frame-cover ak-frame-p-4 ak-frame-ring-2 ak-frame-row">
          <Layer className="ak-layer ak-layer-desaturate-0 ak-frame ak-frame-lg/1 ak-frame-border" />
          <Layer className="ak-layer ak-layer-desaturate-10 ak-frame ak-frame-lg/1 ak-frame-border" />
          <Layer className="ak-layer ak-layer-desaturate-20 ak-frame ak-frame-lg/1 ak-frame-border" />
          <Layer className="ak-layer ak-layer-desaturate-30 ak-frame ak-frame-lg/1 ak-frame-border" />
          <Layer className="ak-layer ak-layer-cool ak-layer-balanced ak-frame ak-frame-lg/1 ak-frame-border ak-edge-warm ak-edge-raw *:ak-text" />
          <Layer className="ak-layer ak-layer-warm ak-layer-balanced ak-frame ak-frame-lg/1 ak-frame-border ak-edge-cool ak-edge-raw *:ak-text" />
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-h-rotate-<number>"
        className="ak-layer ak-frame ak-frame-cover ak-frame-border flex-col border-t-0"
      >
        <Layer className="ak-layer ak-frame ak-frame-cover ak-frame-border ak-frame-row">
          <Cell className="ak-layer-h-rotate-0 ak-layer-balanced ak-edge-darken-100 ak-edge-20 *:ak-text *:ak-text-h-rotate-90" />
          <Cell className="ak-layer-h-rotate-30 ak-layer-balanced ak-edge-desaturate-100 ak-edge-20 ak-edge-l-100 *:ak-text *:ak-text-h-rotate-90" />
          <Cell className="ak-layer-h-rotate-60 ak-layer-balanced *:ak-text *:ak-text-h-rotate-90" />
          <Cell className="ak-layer-h-rotate-90 ak-layer-balanced *:ak-text *:ak-text-h-rotate-90" />
          <Cell className="ak-layer-h-rotate-120 ak-layer-balanced *:ak-text *:ak-text-h-rotate-90" />
          <Cell className="ak-layer-h-rotate-180 ak-layer-balanced *:ak-text *:ak-text-h-rotate-90" />
          <Cell className="ak-layer-h-rotate-240 ak-layer-balanced *:ak-text *:ak-text-h-rotate-90" />
          <Cell className="ak-layer-h-rotate-300 ak-layer-balanced *:ak-text *:ak-text-h-rotate-90" />
          <Cell className="ak-layer-h-rotate-360 ak-layer-balanced *:ak-text *:ak-text-h-rotate-90" />
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-<hue>"
        className="ak-layer ak-frame ak-frame-cover ak-frame-border flex-col border-t-0"
      >
        <Layer className="ak-layer ak-frame ak-frame-cover ak-frame-border ak-frame-row justify-between">
          <Cell className="ak-layer-red ak-layer-balanced ak-frame-cover ak-frame-m-1 *:ak-text" />
          <Cell className="ak-layer-green ak-layer-balanced *:ak-text" />
          <Cell className="ak-layer-blue ak-layer-balanced *:ak-text" />
          <Cell className="ak-layer-magenta ak-layer-balanced *:ak-text" />
          <Cell className="ak-layer-split1 ak-layer-balanced *:ak-text *:ak-text-complementary" />
        </Layer>
      </Layer>
    </>
  );
}

export default function Example() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Layer
        label="One-off"
        className="ak-layer ak-frame ak-frame-[1.25rem]/1 ak-frame-border flex-col"
      >
        <Layer className="flex-wrap items-start">
          <Cell
            label="local contrast"
            className="ak-layer-blue-600 ak-layer-contrast ak-layer-contrast-20"
          />
          <Cell
            label="[--contrast:50]"
            className="[--contrast:50] ak-layer-blue-600 ak-layer-contrast ak-layer-contrast-20"
          />
          <Cell
            label="#898989"
            className="ak-layer-[#131418] *:ak-text *:ak-text-[#898989]"
          />
          <Cell
            label="#808080"
            className="ak-layer-[#131418] *:ak-text *:ak-text-[#808080]"
          />
          <Cell
            label="#248CDF"
            className="ak-layer-[#0C0E12] *:ak-text *:ak-text-[#248CDF]"
          />
          <Cell
            label="#53b4ff"
            className="ak-layer-[#111C2A] *:ak-text *:ak-text-[#53b4ff]"
          />
          <Cell
            label="#007acc"
            className="ak-layer-[#111C2A] *:ak-text *:ak-text-[#007acc]"
          />
          <Cell
            label="L62 orange"
            className="ak-layer-[#0C0E12] *:ak-text *:ak-text-[oklch(0.6243_0.1611_30)]"
          />
          <Cell
            label="L62 green"
            className="ak-layer-[#0C0E12] *:ak-text *:ak-text-[oklch(0.6243_0.1611_150)]"
          />
          <Cell
            label="L62 magenta"
            className="ak-layer-[#0C0E12] *:ak-text *:ak-text-[oklch(0.6243_0.1611_330)]"
          />
          <Cell
            label="L57 orange"
            className="ak-layer-[#111C2A] *:ak-text *:ak-text-[oklch(0.567_0.1616_30)]"
          />
          <Cell
            label="L57 green"
            className="ak-layer-[#111C2A] *:ak-text *:ak-text-[oklch(0.567_0.1616_150)]"
          />
          <Cell
            label="L57 magenta"
            className="ak-layer-[#111C2A] *:ak-text *:ak-text-[oklch(0.567_0.1616_330)]"
          />
          <Cell
            label="#CB8CC6"
            className="ak-layer-[#131418] *:ak-text *:ak-text-[#CB8CC6]"
          />
          <Cell
            label="#CE9178"
            className="ak-layer-[#131418] *:ak-text *:ak-text-[#CE9178]"
          />
          <Cell label="#165DFC" className="*:ak-text *:ak-text-[#165DFC]" />
          <Layer
            label="explicit longhands"
            className="ak-layer ak-frame ak-frame-p-1 ak-frame-border flex-col"
          >
            <Layer className="flex-wrap items-start">
              <Cell
                label="layer"
                className="[--demo-color:oklch(0.55_0.12_260)] [--demo-max-l:80] [--demo-offset:20] ak-layer-color-(--demo-color) ak-layer-offset-(--demo-offset) ak-layer-max-l-(--demo-max-l) *:ak-text"
              />
              <Cell
                label="state"
                className="[--demo-offset:25] ak-state-(--demo-offset)"
              />
              <Cell
                label="mix"
                className="ak-layer-mix [--demo-color:oklch(0.6_0.15_30)] [--demo-mix:35] [--demo-method:oklch] ak-layer-mix-color-(--demo-color) ak-layer-mix-amount-(--demo-mix) ak-layer-mix-method-(--demo-method) *:ak-text"
              />
              <Cell
                label="edge/text/outline"
                className="[--demo-alpha:35] [--demo-color:oklch(0.58_0.18_145)] [--demo-push:25] ak-edge-color-(--demo-color) ak-edge-alpha-(--demo-alpha) ak-outline ak-outline-color-(--demo-color) ak-outline-push-(--demo-push) outline-2 *:ak-text *:ak-text-color-(--demo-color) *:ak-text-push-(--demo-push)"
              />
            </Layer>
          </Layer>
          <Layer
            label="ak-layer! modifier cascade"
            className="ak-layer ak-frame ak-frame-p-1 ak-frame-border flex-col"
          >
            <Layer className="flex-wrap items-start">
              <Cell
                label="base"
                className="ak-layer! ak-layer-[oklch(0.55_0.08_260)]"
              />
              <Cell
                label="mix"
                className="ak-layer! ak-layer-[oklch(0.55_0.08_260)] ak-layer-mix-15"
              />
              <Cell
                label="state"
                className="ak-layer! ak-layer-[oklch(0.55_0.08_260)] ak-state-10"
              />
              <Cell
                label="state lighten"
                className="ak-layer! ak-layer-[oklch(0.55_0.08_260)] ak-state-lighten-20"
              />
              <Cell
                label="state darken"
                className="ak-layer! ak-layer-[oklch(0.55_0.08_260)] ak-state-darken-20"
              />
              <Cell
                label="state saturate"
                className="ak-layer! ak-layer-[oklch(0.55_0.08_260)] ak-state-saturate-50"
              />
              <Cell
                label="state desaturate"
                className="ak-layer! ak-layer-[oklch(0.55_0.08_260)] ak-state-desaturate-50"
              />
              <Cell
                label="state hue"
                className="ak-layer! ak-layer-[oklch(0.55_0.08_260)] ak-state-h-rotate-90"
              />
              <Cell
                label="layer push"
                className="ak-layer! ak-layer-[oklch(0.55_0.08_260)] ak-layer-push-20"
              />
              <Cell
                label="state push"
                className="ak-layer! ak-layer-[oklch(0.55_0.08_260)] ak-state-push-20"
              />
              <Cell
                label="contrast base"
                className="ak-layer! ak-layer-[oklch(0.9_0.08_260)]"
              />
              <Cell
                label="layer contrast"
                className="ak-layer! ak-layer-[oklch(0.9_0.08_260)] ak-layer-contrast ak-layer-contrast-20"
              />
            </Layer>
          </Layer>
          <Layer
            label="ak-layer-l-[6.24999497075] ak-text-<number>"
            className="ak-layer ak-layer-l-[6.24999497075] ak-frame ak-frame-p-1 ak-frame-border flex-col"
          >
            <Layer className="flex-wrap items-start">
              <Cell className="*:ak-text *:ak-text-0" />
              <Cell className="*:ak-text *:ak-text-10" />
              <Cell className="*:ak-text *:ak-text-20" />
              <Cell className="*:ak-text *:ak-text-30" />
              <Cell className="*:ak-text *:ak-text-40" />
              <Cell className="*:ak-text *:ak-text-50" />
              <Cell className="*:ak-text *:ak-text-60" />
              <Cell className="*:ak-text *:ak-text-70" />
              <Cell className="*:ak-text *:ak-text-80" />
              <Cell className="*:ak-text *:ak-text-90" />
              <Cell className="*:ak-text *:ak-text-100" />
            </Layer>
          </Layer>
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-<number>"
        className="ak-layer ak-frame ak-frame-[1.25rem]/1 ak-frame-border flex-col"
      >
        <Layer className="flex-wrap items-start">
          <Layer className="ak-layer ak-layer-0 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-10 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-20 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-30 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-40 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-50 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-60 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-70 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-80 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-90 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-100 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
        </Layer>
      </Layer>
      <Layer
        label="ak-layer-<number> disabled"
        className="ak-layer ak-frame ak-frame-[1.25rem]/1 ak-frame-border flex-col"
        aria-disabled
      >
        <Layer className="flex-wrap items-start">
          <Layer className="ak-layer ak-layer-0 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-10 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-20 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-30 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-40 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-100 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
        </Layer>
      </Layer>
      <Layer
        label="very dark parent (l < 0.13)"
        className="ak-layer ak-frame ak-frame-[1.25rem]/1 ak-frame-border flex-col"
      >
        <Layer className="flex-wrap items-start">
          <Layer className="ak-layer ak-layer-black ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-[oklch(0.05_0_0)] ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-[oklch(0.08_0.02_260)] ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
        </Layer>
      </Layer>
      <Layer className="ak-layer ak-layer-blue-600 ak-frame ak-frame-[1.25rem]/1 ak-frame-border flex-col">
        <Layer className="flex-wrap items-start">
          <Layer className="ak-layer ak-layer-0 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-10 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-20 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-30 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-40 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
          <Layer className="ak-layer ak-layer-50 ak-frame ak-frame-p-1 ak-frame-border flex-col">
            <Layers />
          </Layer>
        </Layer>
      </Layer>
    </div>
  );
}
