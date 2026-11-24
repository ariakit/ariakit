/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Glider } from "@ariakit/ui/components/glider.ariakit.react";
import {
  TabList,
  TabProvider,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { useRef } from "react";
import { Distance } from "#app/components/measure/distance.react.tsx";
import { Figure } from "#app/components/measure/figure.react.tsx";
import { Playback } from "#app/components/measure/playback.react.tsx";
import { Radius } from "#app/components/measure/radius.react.tsx";
import { Zoom } from "#app/components/measure/zoom.react.tsx";

const tabs = {
  overview: "Overview",
  activity: "Activity",
  members: "Members",
};

export default function GliderRadius() {
  const subjectRef = useRef<HTMLDivElement>(null);
  const getList = () => {
    return subjectRef.current?.querySelector<HTMLElement>('[role="tablist"]');
  };
  // The glider draws the selected box in an element of its own. With reduced
  // motion or forced colors, it stays off, and the tab paints the box.
  const getBox = () => {
    const subject = subjectRef.current;
    const box = subject?.querySelector<HTMLElement>(
      ".ui-glider-track:not([data-hidden]) .ui-glider-box[data-selected]",
    );
    return box ?? subject?.querySelector<HTMLElement>('[aria-selected="true"]');
  };
  return (
    <Figure
      controls={
        // A tab scales while it's pressed, which is not the travel of the box.
        <Playback
          target={subjectRef}
          include={(element) => !element.matches('[role="tab"]')}
        />
      }
      caption="The segmented tab list is a frame, and the box of the selected tab is a frame inside it. The glider copies the box to the next tab, and its radius stays concentric with the list as it travels. Select a tab, then slow down, replay, or scrub the travel."
    >
      <Zoom level={1.5}>
        <div ref={subjectRef}>
          <TabProvider defaultSelectedId="activity">
            <TabList aria-label="Section" $kind="segmented" tabs={tabs}>
              <Glider />
            </TabList>
          </TabProvider>
        </div>
      </Zoom>
      <Radius label="Tab list radius" target={getList} />
      <Radius label="Box radius" target={getBox} tone="secondary" />
      <Distance
        label="Tab list padding"
        from={getList}
        to={getBox}
        side="block-start"
        tone="brand"
      />
    </Figure>
  );
}
