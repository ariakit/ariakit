/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import {
  Slider,
  SliderThumb,
} from "@ariakit/ui/components/slider.ariakit.react";
import type { ChangeEvent } from "react";
import { useId, useState } from "react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

const RADII = ["sm", "md", "lg", "xl"];

function SliderValue() {
  const labelId = useId();
  const [radius, setRadius] = useState(2);
  return (
    <div className="grid gap-2">
      <div className="flex justify-between gap-2 text-sm">
        <span id={labelId}>Radius</span>
        <output>{RADII[radius]}</output>
      </div>
      <Slider
        aria-labelledby={labelId}
        min={0}
        max={RADII.length - 1}
        value={radius}
        onChange={(event) => setRadius(event.currentTarget.valueAsNumber)}
      />
    </div>
  );
}

// The parent keeps the value at 80 or less, so the input goes back to 80 after
// a change above it.
function SliderLimit() {
  const [volume, setVolume] = useState(60);
  return (
    <div className="grid gap-2">
      <output className="text-sm">Volume {volume}</output>
      <Slider
        aria-label="Limited volume"
        value={volume}
        onChange={(event) =>
          setVolume(Math.min(80, event.currentTarget.valueAsNumber))
        }
      />
    </div>
  );
}

function SliderNumberField() {
  const [opacity, setOpacity] = useState(40);
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.valueAsNumber;
    if (Number.isNaN(value)) return;
    setOpacity(Math.min(100, Math.max(0, value)));
  };
  return (
    <div className="flex items-center gap-3">
      <Input
        aria-label="Opacity percent"
        type="number"
        min={0}
        max={100}
        value={opacity}
        onChange={onChange}
        className="w-20 flex-none"
      />
      <Slider aria-label="Opacity" value={opacity} onChange={onChange} />
    </div>
  );
}

function SliderForm() {
  const [submitted, setSubmitted] = useState<string>();
  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const brightness = new FormData(event.currentTarget).get("brightness");
        if (typeof brightness !== "string") return;
        setSubmitted(brightness);
      }}
    >
      <Slider aria-label="Brightness" name="brightness" defaultValue={20} />
      <div className="flex items-center gap-3">
        <Button type="submit">Save</Button>
        <Button type="reset" $kind="flat">
          Reset
        </Button>
        {submitted != null && <output>Saved {submitted}</output>}
      </div>
    </form>
  );
}

// The slider is outside the form, and the form attribute links it only after a
// button press, so the form that owns it changes after it mounts.
function SliderFormOwner() {
  const formId = useId();
  const [linked, setLinked] = useState(false);
  return (
    <div className="grid gap-3">
      <Slider
        aria-label="Contrast"
        defaultValue={30}
        form={linked ? formId : undefined}
      />
      <form id={formId} className="flex items-center gap-3">
        <Button type="button" onClick={() => setLinked(!linked)}>
          {linked ? "Unlink the slider" : "Link the slider"}
        </Button>
        <Button type="reset" $kind="flat">
          Reset
        </Button>
      </form>
    </div>
  );
}

export default function SliderExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="A native range input from 0 to 100 that starts in the middle, like the native control."
        stretch
        code={`
          <Slider aria-label="Volume" />
        `}
      >
        <Slider aria-label="Volume" />
      </Example>

      <Example
        title="Value"
        description="A controlled value with a visible label and a readout. The input rounds the value to the step, so the thumb stops on each radius."
        stretch
        code={`
          <Slider min={0} max={3} value={radius} onChange={...} />
        `}
      >
        <SliderValue />
      </Example>

      <Example
        title="Limited value"
        description="The parent keeps the value at 80 or less. A drag past 80 leaves the thumb at 80, where the value is."
        stretch
        code={`
          <Slider value={volume} onChange={(event) => setVolume(Math.min(80, ...))} />
        `}
      >
        <SliderLimit />
      </Example>

      <Example
        title="Number field"
        description="A number field before the slider sets the same value. Focus on the field doesn't show a ring on the thumb."
        stretch
        code={`
          <Input type="number" value={opacity} onChange={...} />
          <Slider value={opacity} onChange={...} />
        `}
      >
        <SliderNumberField />
      </Example>

      <Example
        title="Form"
        description="The input goes in the form data, and a form reset moves the thumb back to the default value."
        stretch
        code={`
          <Slider name="brightness" defaultValue={20} />
        `}
      >
        <SliderForm />
      </Example>

      <Example
        title="Form attribute"
        description="The form attribute links a slider outside the form. A reset moves the thumb back to the default value, also when the link changes after render."
        stretch
        code={`
          <Slider defaultValue={30} form={linked ? formId : undefined} />
          <form id={formId}>...</form>
        `}
      >
        <SliderFormOwner />
      </Example>

      <Example
        title="Step"
        description="A fractional step. The thumb follows the rounded value."
        stretch
        code={`
          <Slider min={0} max={1} step={0.25} defaultValue={0.75} />
        `}
      >
        <Slider
          aria-label="Opacity"
          min={0}
          max={1}
          step={0.25}
          defaultValue={0.75}
        />
      </Example>

      <Example
        title="Right to left"
        description="In RTL, the minimum is on the right, for the input and the drawn parts."
        stretch
        code={`
          <Slider dir="rtl" defaultValue={25} />
        `}
      >
        <Slider aria-label="Balance" dir="rtl" defaultValue={25} />
      </Example>

      <Example
        title="Disabled"
        description="A disabled input fades the fill and the thumb, and the pointer can't move it."
        stretch
        code={`
          <Slider disabled defaultValue={60} />
        `}
      >
        <Slider aria-label="Locked level" disabled defaultValue={60} />
      </Example>

      <Example
        title="Custom parts"
        description="The track, fill, and thumb take props or elements, such as a thicker track with a success fill and thumb. A larger thumb size also sizes the thumb of the input."
        stretch
        code={`
          <Slider
            $thumbSize={8}
            track={{ $thickness: 3 }}
            fill={{ $layer: "success" }}
            thumb={<SliderThumb $layer="success" />}
          />
        `}
      >
        <Slider
          aria-label="Progress goal"
          defaultValue={70}
          $thumbSize={8}
          track={{ $thickness: 3 }}
          fill={{ $layer: "success" }}
          thumb={<SliderThumb $layer="success" />}
        />
      </Example>
    </ExampleGrid>
  );
}
