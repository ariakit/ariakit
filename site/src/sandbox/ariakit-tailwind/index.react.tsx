import clsx from "clsx";
import type { ComponentProps } from "react";
import { useId } from "react";

interface LayerProps extends ComponentProps<"section"> {
  title: string;
  orientation?: "vertical" | "horizontal";
}

function Layer({
  title,
  children,
  orientation = "horizontal",
  ...props
}: LayerProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      {...props}
      className={clsx(
        "ak-layer ak-frame ak-frame-2xl/1 ak-edge-20 ak-frame-bordering font-mono flex gap-1 flex-col",
        props.className,
      )}
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

function Layers(props: Omit<LayerProps, "title">) {
  return (
    <>
      <Layer
        {...props}
        title="0"
        className={clsx("ak-layer-0", props.className)}
      />
      <Layer
        {...props}
        title="10"
        className={clsx("ak-layer-10", props.className)}
      />
      <Layer
        {...props}
        title="20"
        className={clsx("ak-layer-20", props.className)}
      />
      <Layer
        {...props}
        title="30"
        className={clsx("ak-layer-30", props.className)}
      />
      <Layer
        {...props}
        title="40"
        className={clsx("ak-layer-40", props.className)}
      />
      <Layer
        {...props}
        title="50"
        className={clsx("ak-layer-50", props.className)}
      />
      <Layer
        {...props}
        title="60"
        className={clsx("ak-layer-60", props.className)}
      />
      <Layer
        {...props}
        title="70"
        className={clsx("ak-layer-70", props.className)}
      />
      <Layer
        {...props}
        title="80"
        className={clsx("ak-layer-80", props.className)}
      />
      <Layer
        {...props}
        title="90"
        className={clsx("ak-layer-90", props.className)}
      />
      <Layer
        {...props}
        title="100"
        className={clsx("ak-layer-100", props.className)}
      />
    </>
  );
}

function LayersState(props: Omit<LayerProps, "title">) {
  return (
    <>
      <Layer
        {...props}
        title="0"
        className={clsx("ak-state-0", props.className)}
      />
      <Layer
        {...props}
        title="10"
        className={clsx("ak-state-10", props.className)}
      />
      <Layer
        {...props}
        title="20"
        className={clsx("ak-state-20", props.className)}
      />
      <Layer
        {...props}
        title="30"
        className={clsx("ak-state-30", props.className)}
      />
      <Layer
        {...props}
        title="40"
        className={clsx("ak-state-40", props.className)}
      />
      <Layer
        {...props}
        title="50"
        className={clsx("ak-state-50", props.className)}
      />
      <Layer
        {...props}
        title="60"
        className={clsx("ak-state-60", props.className)}
      />
      <Layer
        {...props}
        title="70"
        className={clsx("ak-state-70", props.className)}
      />
      <Layer
        {...props}
        title="80"
        className={clsx("ak-state-80", props.className)}
      />
      <Layer
        {...props}
        title="90"
        className={clsx("ak-state-90", props.className)}
      />
      <Layer
        {...props}
        title="100"
        className={clsx("ak-state-100", props.className)}
      />
    </>
  );
}

function LayersContrast(props: Omit<LayerProps, "title">) {
  return (
    <>
      <Layer
        {...props}
        title="0"
        className={clsx("ak-layer-contrast-0", props.className)}
      />
      <Layer
        {...props}
        title="10"
        className={clsx("ak-layer-contrast-10", props.className)}
      />
      <Layer
        {...props}
        title="20"
        className={clsx("ak-layer-contrast-20", props.className)}
      />
      <Layer
        {...props}
        title="30"
        className={clsx("ak-layer-contrast-30", props.className)}
      />
      <Layer
        {...props}
        title="40"
        className={clsx("ak-layer-contrast-40", props.className)}
      />
      <Layer
        {...props}
        title="50"
        className={clsx("ak-layer-contrast-50", props.className)}
      />
      <Layer
        {...props}
        title="60"
        className={clsx("ak-layer-contrast-60", props.className)}
      />
      <Layer
        {...props}
        title="70"
        className={clsx("ak-layer-contrast-70", props.className)}
      />
      <Layer
        {...props}
        title="80"
        className={clsx("ak-layer-contrast-80", props.className)}
      />
      <Layer
        {...props}
        title="90"
        className={clsx("ak-layer-contrast-90", props.className)}
      />
      <Layer
        {...props}
        title="100"
        className={clsx("ak-layer-contrast-100", props.className)}
      />
    </>
  );
}

function LayersMix(props: Omit<LayerProps, "title">) {
  return (
    <>
      <Layer
        {...props}
        title="0"
        className={clsx("ak-layer-mix-red-500 ak-layer-mix-0", props.className)}
      />
      <Layer
        {...props}
        title="10"
        className={clsx(
          "ak-layer-mix-red-500 ak-layer-mix-10",
          props.className,
        )}
      />
      <Layer
        {...props}
        title="20"
        className={clsx(
          "ak-layer-mix-red-500 ak-layer-mix-20",
          props.className,
        )}
      />
      <Layer
        {...props}
        title="30"
        className={clsx(
          "ak-layer-mix-red-500 ak-layer-mix-30",
          props.className,
        )}
      />
      <Layer
        {...props}
        title="40"
        className={clsx(
          "ak-layer-mix-red-500 ak-layer-mix-40",
          props.className,
        )}
      />
      <Layer
        {...props}
        title="50"
        className={clsx(
          "ak-layer-mix-red-500 ak-layer-mix-50",
          props.className,
        )}
      />
      <Layer
        {...props}
        title="60"
        className={clsx(
          "ak-layer-mix-red-500 ak-layer-mix-60",
          props.className,
        )}
      />
      <Layer
        {...props}
        title="70"
        className={clsx(
          "ak-layer-mix-red-500 ak-layer-mix-70",
          props.className,
        )}
      />
      <Layer
        {...props}
        title="80"
        className={clsx(
          "ak-layer-mix-red-500 ak-layer-mix-80",
          props.className,
        )}
      />
      <Layer
        {...props}
        title="90"
        className={clsx(
          "ak-layer-mix-red-500 ak-layer-mix-90",
          props.className,
        )}
      />
      <Layer
        {...props}
        title="100"
        className={clsx(
          "ak-layer-mix-red-500 ak-layer-mix-100",
          props.className,
        )}
      />
    </>
  );
}

function LayersLighten(props: Omit<LayerProps, "title">) {
  return (
    <>
      <Layer
        {...props}
        title="0"
        className={clsx("ak-layer-lighten-0", props.className)}
      />
      <Layer
        {...props}
        title="10"
        className={clsx("ak-layer-lighten-10", props.className)}
      />
      <Layer
        {...props}
        title="20"
        className={clsx("ak-layer-lighten-20", props.className)}
      />
      <Layer
        {...props}
        title="30"
        className={clsx("ak-layer-lighten-30", props.className)}
      />
      <Layer
        {...props}
        title="40"
        className={clsx("ak-layer-lighten-40", props.className)}
      />
      <Layer
        {...props}
        title="50"
        className={clsx("ak-layer-lighten-50", props.className)}
      />
      <Layer
        {...props}
        title="60"
        className={clsx("ak-layer-lighten-60", props.className)}
      />
      <Layer
        {...props}
        title="70"
        className={clsx("ak-layer-lighten-70", props.className)}
      />
      <Layer
        {...props}
        title="80"
        className={clsx("ak-layer-lighten-80", props.className)}
      />
      <Layer
        {...props}
        title="90"
        className={clsx("ak-layer-lighten-90", props.className)}
      />
      <Layer
        {...props}
        title="100"
        className={clsx("ak-layer-lighten-100", props.className)}
      />
    </>
  );
}

function LayersDarken(props: Omit<LayerProps, "title">) {
  return (
    <>
      <Layer
        {...props}
        title="0"
        className={clsx("ak-layer-darken-0", props.className)}
      />
      <Layer
        {...props}
        title="10"
        className={clsx("ak-layer-darken-10", props.className)}
      />
      <Layer
        {...props}
        title="20"
        className={clsx("ak-layer-darken-20", props.className)}
      />
      <Layer
        {...props}
        title="30"
        className={clsx("ak-layer-darken-30", props.className)}
      />
      <Layer
        {...props}
        title="40"
        className={clsx("ak-layer-darken-40", props.className)}
      />
      <Layer
        {...props}
        title="50"
        className={clsx("ak-layer-darken-50", props.className)}
      />
      <Layer
        {...props}
        title="60"
        className={clsx("ak-layer-darken-60", props.className)}
      />
      <Layer
        {...props}
        title="70"
        className={clsx("ak-layer-darken-70", props.className)}
      />
      <Layer
        {...props}
        title="80"
        className={clsx("ak-layer-darken-80", props.className)}
      />
      <Layer
        {...props}
        title="90"
        className={clsx("ak-layer-darken-90", props.className)}
      />
      <Layer
        {...props}
        title="100"
        className={clsx("ak-layer-darken-100", props.className)}
      />
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
        <Layers className="ak-layer-brand" orientation="vertical">
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
