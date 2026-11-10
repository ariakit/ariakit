/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { BreadcrumbProps } from "@ariakit/ui/components/breadcrumb.ariakit.react";
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbLabel,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbSlot,
  BreadcrumbText,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import type { BreadcrumbSeparatorProps } from "@ariakit/ui/components/breadcrumb.ariakit.react";
import { Folder, House } from "lucide-react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

interface ShyTrailProps extends BreadcrumbProps {
  shy?: BreadcrumbSeparatorProps["$shy"];
}

function ShyTrail({ shy, ...props }: ShyTrailProps) {
  return (
    <Breadcrumb {...props}>
      <BreadcrumbLink href="#garden" $hoverOffset>
        Garden
      </BreadcrumbLink>
      <BreadcrumbSeparator $shy={shy} />
      <BreadcrumbCurrent>Tools</BreadcrumbCurrent>
    </Breadcrumb>
  );
}

export default function BreadcrumbSandbox() {
  return (
    <ExampleGrid>
      <Example
        title="Clipped labels in a scrolling trail"
        description="The row keeps all of its text, and the first step stays in view."
        code={`
          <Breadcrumb $scroll>
            <BreadcrumbLink href="#northwind">
              <BreadcrumbLabel $truncate>Northwind</BreadcrumbLabel>
            </BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbCurrent>Tools</BreadcrumbCurrent>
          </Breadcrumb>
        `}
      >
        <Breadcrumb aria-label="Scrolling clipped labels" $scroll>
          <BreadcrumbLink href="#northwind">
            <BreadcrumbLabel $truncate>Northwind</BreadcrumbLabel>
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbCurrent>Tools</BreadcrumbCurrent>
        </Breadcrumb>
      </Example>

      <Example
        title="Shy separators"
        description="A separator with $shy hides beside a hover surface in any gap, and one with $shy set to false never hides."
        code={`
          <BreadcrumbSeparator $shy />
          <BreadcrumbSeparator $shy={false} />
        `}
      >
        <ShyTrail aria-label="Always shy in a wide gap" shy $gap={4} />
        <ShyTrail aria-label="Never shy in a small gap" shy={false} />
      </Example>

      <Example
        title="Hovered step"
        description="$hovered shows the hover state of a step while the pointer is elsewhere, such as on the anchor of an open hovercard. The separator beside it hides, as beside a step under the pointer."
        code={`
          <BreadcrumbLink href="#garden" $hoverOffset $hovered>
            Garden
          </BreadcrumbLink>
        `}
      >
        <Breadcrumb aria-label="Hovered step">
          <BreadcrumbLink href="#garden" $hoverOffset $hovered>
            Garden
          </BreadcrumbLink>
          <BreadcrumbSeparator $shy />
          <BreadcrumbCurrent>Tools</BreadcrumbCurrent>
        </Breadcrumb>
      </Example>

      <Example
        title="Clipped label narrower than the minimum"
        description="The label adds no space beside its text."
        code={`
          <BreadcrumbLink href="#a">
            <BreadcrumbLabel $truncate>il</BreadcrumbLabel>
          </BreadcrumbLink>
        `}
      >
        <Breadcrumb aria-label="Clipped labels narrower than the minimum">
          <BreadcrumbLink href="#a">
            <BreadcrumbLabel $truncate>il</BreadcrumbLabel>
          </BreadcrumbLink>
        </Breadcrumb>
      </Example>

      <Example
        title="Slots and separator kinds"
        description="The first icon lines up with the text above it, and each kind of separator shows between two steps."
        code={`
          <BreadcrumbSeparator />
          <BreadcrumbSeparator $kind="chevron" />
          <BreadcrumbSeparator $kind="pipe" />
          <BreadcrumbSeparator $kind="none">·</BreadcrumbSeparator>
        `}
      >
        Text around a trail
        <Breadcrumb aria-label="Icon and marks">
          <BreadcrumbLink href="#home" aria-label="Home" $hoverOffset>
            <BreadcrumbSlot>
              <House />
            </BreadcrumbSlot>
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#garden">
            <BreadcrumbSlot>
              <Folder />
            </BreadcrumbSlot>
            <BreadcrumbLabel>Garden</BreadcrumbLabel>
          </BreadcrumbLink>
          <BreadcrumbSeparator $kind="chevron" />
          <BreadcrumbLink href="#tools">Tools</BreadcrumbLink>
          <BreadcrumbSeparator $kind="pipe" />
          <BreadcrumbLink href="#shears">Shears</BreadcrumbLink>
          <BreadcrumbSeparator $kind="none">·</BreadcrumbSeparator>
          <BreadcrumbCurrent>Blades</BreadcrumbCurrent>
        </Breadcrumb>
      </Example>

      <Example
        title="Link ink"
        description="A link can set its own ink."
        code={`
          <BreadcrumbLink href="#full" $ink={100}>Full ink</BreadcrumbLink>
        `}
      >
        <Breadcrumb aria-label="Custom ink">
          <BreadcrumbLink href="#default">Default ink</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#full" $ink={100}>
            Full ink
          </BreadcrumbLink>
        </Breadcrumb>
      </Example>

      <Example
        title="Level without a page"
        description="A level without a page of its own is text with the ink of the links. It is neither a link nor the current page."
        code={`
          <BreadcrumbText separator>Tools</BreadcrumbText>
        `}
      >
        <Breadcrumb aria-label="Level without a page">
          <BreadcrumbLink href="#garden">Garden</BreadcrumbLink>
          <BreadcrumbText separator>Tools</BreadcrumbText>
          <BreadcrumbCurrent separator>Shears</BreadcrumbCurrent>
        </Breadcrumb>
      </Example>

      <Example
        title="Current page as a link"
        description="Only the link that matches currentUrl gets aria-current."
        code={`
          <BreadcrumbLink href="/garden/tools" currentUrl="/garden/tools">
            Tools
          </BreadcrumbLink>
        `}
      >
        <Breadcrumb aria-label="Current page as a link">
          <BreadcrumbLink href="/garden" currentUrl="/garden/tools">
            Garden
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="/garden/tools" currentUrl="/garden/tools">
            Tools
          </BreadcrumbLink>
        </Breadcrumb>
      </Example>

      <Example
        title="Separator element"
        description="A plain list item passed to separator stays out of the list that screen readers count."
        code={`
          <BreadcrumbCurrent separator={<li>›</li>}>Tools</BreadcrumbCurrent>
        `}
      >
        <Breadcrumb aria-label="Separator element">
          <BreadcrumbLink href="#garden">Garden</BreadcrumbLink>
          <BreadcrumbCurrent separator={<li>›</li>}>Tools</BreadcrumbCurrent>
        </Breadcrumb>
      </Example>
    </ExampleGrid>
  );
}
