/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import {
  Badge,
  BadgeLabel,
  BadgeSlot,
} from "@ariakit/ui/components/badge.ariakit.react";
import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardContent,
  CheckboxCardDescription,
  CheckboxCardGrid,
  CheckboxCardLabel,
  CheckboxCardSlot,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import { ChartBar, Sparkles } from "lucide-react";
import { Example, ExampleGrid } from "../example.react.tsx";
import { createGalleryPage } from "../shell.react.tsx";

export function CheckboxFixturesExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Right to left tile"
        description="A tile card in a right-to-left page. The slot starts at the right edge and the check ends at the left edge."
      >
        <div dir="rtl" lang="ar" className="w-full">
          <CheckboxCardGrid aria-label="الميزات" $minItemSize="12rem">
            <CheckboxCard value="analytics" $orientation="vertical" $p={4}>
              <CheckboxCardSlot
                $size="2xl"
                $layer="brand"
                $mix={20}
                $rounded="lg"
              >
                <ChartBar />
              </CheckboxCardSlot>
              <CheckboxCardContent>
                <CheckboxCardLabel>التحليلات</CheckboxCardLabel>
                <CheckboxCardDescription>
                  الاستخدام والاحتفاظ
                </CheckboxCardDescription>
              </CheckboxCardContent>
              <CheckboxCardCheck />
            </CheckboxCard>
          </CheckboxCardGrid>
        </div>
      </Example>

      <Example
        title="Tile with a badge"
        description="A badge in a tile's content or in its top row keeps its own slot spacing. The same badge follows the tiles for comparison."
        stretch
      >
        <CheckboxCardGrid aria-label="Plans" $minItemSize="12rem">
          <CheckboxCard value="pro" $orientation="vertical" $p={4}>
            <CheckboxCardSlot
              $size="2xl"
              $layer="brand"
              $mix={20}
              $rounded="lg"
            >
              <ChartBar />
            </CheckboxCardSlot>
            <CheckboxCardContent>
              <CheckboxCardLabel>Pro</CheckboxCardLabel>
              <Badge $layer="brand">
                <BadgeSlot>
                  <Sparkles />
                </BadgeSlot>
                <BadgeLabel>Recommended</BadgeLabel>
              </Badge>
            </CheckboxCardContent>
            <CheckboxCardCheck />
          </CheckboxCard>
          <CheckboxCard value="team" $orientation="vertical" $p={4}>
            <CheckboxCardSlot
              $size="2xl"
              $layer="brand"
              $mix={20}
              $rounded="lg"
            >
              <ChartBar />
            </CheckboxCardSlot>
            <Badge $layer="brand">
              <BadgeSlot>
                <Sparkles />
              </BadgeSlot>
              <BadgeLabel>Popular</BadgeLabel>
            </Badge>
            <CheckboxCardContent>
              <CheckboxCardLabel>Team</CheckboxCardLabel>
            </CheckboxCardContent>
            <CheckboxCardCheck />
          </CheckboxCard>
        </CheckboxCardGrid>
        {/* A row, so the badge keeps its own width outside the tile. */}
        <div className="flex">
          <Badge $layer="brand">
            <BadgeSlot>
              <Sparkles />
            </BadgeSlot>
            <BadgeLabel>Recommended</BadgeLabel>
          </Badge>
        </div>
      </Example>
    </ExampleGrid>
  );
}

export default createGalleryPage("checkbox-fixtures", CheckboxFixturesExamples);
