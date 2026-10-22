import {
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  RadioDescription,
  RadioField,
  RadioGroup,
  RadioLabel,
  RadioProvider,
} from "@ariakit/ui/components/radio.ariakit.react";
import {
  Skeleton,
  SkeletonCircle,
  SkeletonFill,
  SkeletonLine,
  useSkeletonState,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRequest } from "../use-request.ts";

const speeds = [
  { label: "Fast", latency: 50 },
  { label: "Medium", latency: 250 },
  { label: "Slow", latency: 1500 },
];

const contact = {
  name: "Jonas Weber",
  email: "jonas@example.com",
  initials: "JW",
};

export default function Example() {
  const [latency, setLatency] = useState(250);
  const { data, loading, reload } = useRequest(contact, latency);
  return (
    <div className="grid w-[26rem] max-w-full gap-5">
      <RadioProvider
        value={String(latency)}
        setValue={(value) => {
          setLatency(Number(value));
          reload();
        }}
      >
        <RadioGroup
          aria-label="Network speed"
          className="flex flex-wrap justify-center gap-x-5 gap-y-2"
        >
          {speeds.map((speed) => (
            <RadioField key={speed.label} value={String(speed.latency)}>
              <RadioLabel>{speed.label}</RadioLabel>
              <RadioDescription>{speed.latency} ms</RadioDescription>
            </RadioField>
          ))}
        </RadioGroup>
      </RadioProvider>
      <Frame
        $layer
        $lighten
        $rounded="xl"
        $border
        $p={4}
        render={<section aria-label="Contact" aria-busy={loading} />}
        className="shadow-xs"
      >
        <p role="status" className="sr-only">
          {loading ? "Loading contact" : "Contact loaded"}
        </p>
        <Skeleton loading={loading} delay={150} className="grid gap-4">
          <div className="flex items-center gap-3">
            <SkeletonCircle className="size-10 shrink-0">
              <Frame
                $layer="secondary"
                $rounded="full"
                $forceRounded
                $p="none"
                aria-hidden
                className="grid size-10 shrink-0 place-items-center"
              >
                <span className="text-sm font-semibold">{data?.initials}</span>
              </Frame>
            </SkeletonCircle>
            <div className="grid min-w-0 flex-1">
              <SkeletonLine className="w-28">
                <span className="font-medium">{data?.name}</span>
              </SkeletonLine>
              <SkeletonLine $weight="light" className="w-36 text-sm">
                <span className="block text-sm ak-ink-70">{data?.email}</span>
              </SkeletonLine>
            </div>
            <SkeletonFill>
              <Button $kind="bevel">Message</Button>
            </SkeletonFill>
          </div>
          <Timeline />
        </Skeleton>
      </Frame>
      <Button onClick={reload} className="justify-self-center">
        <ButtonSlot aria-hidden>
          <RotateCw />
        </ButtonSlot>
        <ButtonLabel>Reload</ButtonLabel>
      </Button>
    </div>
  );
}

interface Times {
  skeleton?: number;
  content?: number;
}

// Records when each skeleton state appears, relative to the start of loading.
function Timeline() {
  const state = useSkeletonState();
  const startRef = useRef(0);
  const [times, setTimes] = useState<Times>({});

  useEffect(() => {
    // This effect runs before the effect of the parent Skeleton that starts the
    // delay, so the times never come out shorter than the real delays.
    if (state === "pending") {
      startRef.current = performance.now();
    }
    // The next frame is when the state appears on screen.
    const frame = requestAnimationFrame(() => {
      if (state === "pending") {
        setTimes({});
        return;
      }
      const elapsed = Math.round(performance.now() - startRef.current);
      setTimes((times) => ({ ...times, [state]: elapsed }));
    });
    return () => cancelAnimationFrame(frame);
  }, [state]);

  const rows = [
    {
      label: "Placeholders shown",
      value: formatTime(times.skeleton, times.content != null),
    },
    { label: "Content shown", value: formatTime(times.content) },
  ];

  return (
    <Frame
      $layer
      $darken={0.25}
      $rounded="lg"
      $p={3}
      render={<dl />}
      className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm"
    >
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="ak-ink-70">{row.label}</dt>
          <dd className="text-end font-medium tabular-nums">{row.value}</dd>
        </div>
      ))}
    </Frame>
  );
}

function formatTime(time?: number, skipped = false) {
  if (time != null) {
    return `${time} ms`;
  }
  if (skipped) return "Skipped";
  return "…";
}
