import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { PlaceholderText } from "#app/components/placeholder-text.react.tsx";

export default function Thumbnail() {
  return (
    <div
      className="flex justify-center pointer-events-none text-xs"
      aria-hidden
    >
      <Frame
        $layer
        $rounded="xl"
        $border
        $p="none"
        className="mt-5 grid w-80 grid-cols-[5rem_1fr_4rem] grid-rows-[2.25rem_7.5rem] overflow-clip"
      >
        <Frame
          $layer
          $darken={0.5}
          $p="none"
          className="col-span-full flex items-center justify-between px-2"
        >
          <PlaceholderText weight="bold">Acme</PlaceholderText>
          <PlaceholderText>Docs</PlaceholderText>
        </Frame>
        <Frame $layer $darken={0.25} $p={1.5} className="flex flex-col gap-1.5">
          <PlaceholderText weight="medium">Start</PlaceholderText>
          <PlaceholderText weight="light">Guides</PlaceholderText>
          <PlaceholderText weight="light">API</PlaceholderText>
        </Frame>
        <div className="flex flex-col gap-1.5 p-2">
          <PlaceholderText weight="bold" size="lg">
            Overview
          </PlaceholderText>
          <PlaceholderText weight="light">Sticky parts</PlaceholderText>
          <PlaceholderText weight="light">and panels</PlaceholderText>
        </div>
        <Frame $layer $darken={0.25} $p={1.5} className="flex flex-col gap-1.5">
          <PlaceholderText weight="light">Intro</PlaceholderText>
          <PlaceholderText weight="light">Use</PlaceholderText>
        </Frame>
      </Frame>
    </div>
  );
}
