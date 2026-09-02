/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { ContainerProps } from "@ariakit/ui/components/container.ariakit.react.tsx";
import { Container } from "@ariakit/ui/components/container.ariakit.react.tsx";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react.tsx";
import { Caption, Placeholder, Sample, Samples } from "./gallery.react.tsx";

interface RulerProps extends ContainerProps {
  label: string;
}

/**
 * A container drawn as a measured band inside a dashed track, so its width
 * and gutter can be read against the card.
 */
function Ruler({ label, ...props }: RulerProps) {
  return (
    <Frame
      $rounded="lg"
      $p="none"
      $border
      $borderType="dashed"
      className="grid"
    >
      <Container {...props}>
        <Placeholder className="grid min-h-10 place-items-center text-xs">
          {label}
        </Placeholder>
      </Container>
    </Frame>
  );
}

export function ContainerSection() {
  return (
    <Samples columns="wide">
      <Sample
        title="Size"
        code='$size="default" | "24rem" | "calc(100% - 4rem)" | "none"'
        description="A theme token name or a raw length caps the width. The dashed track is the available space."
      >
        <div className="grid gap-3">
          <Ruler
            label='$size="default" (72rem, fills this card)'
            $size="default"
          />
          <Ruler label='$size="32rem"' $size="32rem" />
          <Ruler label='$size="24rem"' $size="24rem" />
          <Ruler label='$size="calc(100% - 4rem)"' $size="calc(100% - 4rem)" />
          <Ruler label="no size" />
        </div>
      </Sample>

      <Sample
        title="Gutter"
        code='$p={4} | $p={8} | $p="none"'
        description="The minimum space the container keeps from the edges when the width is capped by the space around it rather than by its size."
      >
        <div className="grid gap-3">
          <Ruler label="$p={4}" $p={4} />
          <Ruler label="$p={8}" $p={8} />
          <Ruler label='$p="3rem"' $p="3rem" />
          <Ruler label='$p="none"' $p="none" />
        </div>
      </Sample>

      <Sample
        title="Inherited size and gutter"
        code="Container $size $p → nested Container"
        description="Both props are inherited custom properties, so one ancestor sizes every container below it until one resets them."
      >
        <Frame
          $rounded="lg"
          $p="none"
          $border
          $borderType="dashed"
          className="grid"
        >
          <Container $size="28rem" $p={4} className="grid gap-3 py-3">
            <Caption>Ancestor: $size="28rem" $p={4}</Caption>
            <Container>
              <Placeholder className="grid min-h-10 place-items-center text-xs">
                Inherits 28rem
              </Placeholder>
            </Container>
            <Container $size="20rem">
              <Placeholder className="grid min-h-10 place-items-center text-xs">
                Own $size="20rem"
              </Placeholder>
            </Container>
            <Container $size="none" $p="none">
              <Placeholder className="grid min-h-10 place-items-center text-xs">
                $size="none" $p="none"
              </Placeholder>
            </Container>
          </Container>
        </Frame>
      </Sample>
    </Samples>
  );
}
