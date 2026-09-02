/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react.tsx";
import { Code } from "@ariakit/ui/components/code.ariakit.react.tsx";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import {
  List,
  ListDisclosure,
  ListDisclosureButton,
  ListItem,
  ListItemMarker,
} from "@ariakit/ui/components/list.ariakit.react.tsx";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react.tsx";
import { Caption, Sample, Samples } from "./gallery.react.tsx";

export function ListSection() {
  return (
    <Samples>
      <Sample
        title="Inline rows"
        code="List · List ordered"
        description="Unordered rows put a short dash in the gutter, ordered rows a numbered chip. Text that wraps stays clear of the marker column."
      >
        <List>
          <ListItem>Unordered rows put a short dash in the gutter</ListItem>
          <ListItem>
            Text that wraps to a second line stays clear of the marker column,
            because the item reserves it with its own start padding
          </ListItem>
          <ListItem>Rows without block children keep the tight rhythm</ListItem>
        </List>
        <List ordered>
          <ListItem>Ordered rows show a numbered chip instead</ListItem>
          <ListItem>
            The number comes from the list counter, so no row carries an index
          </ListItem>
          <ListItem>Inline rows draw no connector segments</ListItem>
        </List>
      </Sample>

      <Sample
        title="Blocks mode"
        code="ListItem > p"
        description="A block child opens the gap and gives every row a roomier frame. Ordered blocks grow a connector between the numbers, and the last segment fades out."
      >
        <List ordered>
          <ListItem>
            <p>
              <strong>Install the package</strong>
            </p>
            <p>
              A block child opens the gap and gives every row a roomier frame.
            </p>
          </ListItem>
          <ListItem>
            <p>
              <strong>Configure the styles</strong>
            </p>
            <p>Ordered blocks also grow a connector between the numbers.</p>
          </ListItem>
          <ListItem>
            <p>
              <strong>Review the gallery</strong>
            </p>
            <p>The final segment fades out and stops at its own row.</p>
          </ListItem>
        </List>
        <List>
          <ListItem>
            <p>
              <strong>Unordered blocks</strong>
            </p>
            <p>They share the rhythm, but they connect no rows.</p>
          </ListItem>
          <ListItem>
            <p>
              <strong>Same channels</strong>
            </p>
            <p>Only the list kind decides whether a connector paints.</p>
          </ListItem>
        </List>
      </Sample>

      <Sample
        title="Sections mode"
        code="ListItem > Heading"
        description="A heading child opens the gap to the full list rhythm, and wins over blocks mode when a list matches both."
      >
        <HeadingLevel level={4}>
          <List>
            <ListItem>
              <Heading>Heading children</Heading>
              <p>A heading child opens the gap to the full list rhythm.</p>
            </ListItem>
            <ListItem>
              <Heading>Precedence</Heading>
              <p>Sections mode wins when a list matches blocks mode too.</p>
            </ListItem>
          </List>
        </HeadingLevel>
      </Sample>

      <Sample
        title="Nested"
        code="List inside ListItem"
        description="A nested list halves its gap and resets the list kind, so the parent kind does not leak in. The outer counter continues past it."
      >
        <List ordered>
          <ListItem>
            Ordered parent row
            <List>
              <ListItem>A nested list tightens its own base gap</ListItem>
              <ListItem>
                It also resets the list kind flags, so the parent kind does not
                leak in
              </ListItem>
            </List>
          </ListItem>
          <ListItem>The parent counter continues past the nested rows</ListItem>
        </List>
        <List ordered>
          <ListItem>
            <p>
              <strong>Nested rows in blocks mode</strong>
            </p>
            <List ordered>
              <ListItem>
                <p>The nested rows connect to each other</p>
              </ListItem>
              <ListItem>
                <p>Only the nested list's own last row fades out</p>
              </ListItem>
            </List>
          </ListItem>
          <ListItem>
            <p>The outer segment reaches this row unbroken</p>
          </ListItem>
        </List>
      </Sample>

      <Sample
        title="Check and progress markers"
        code="ListItem checked · checked={false} · progress={0.65}"
        description="A check slot replaces the bullet or the number. A progress arc rings the slot, and a full arc completes it."
      >
        <List>
          <ListItem>A plain bullet</ListItem>
          <ListItem checked={false}>An empty check slot</ListItem>
          <ListItem progress={0.65}>A progress arc around the slot</ListItem>
          <ListItem progress={1}>A full arc completes the row</ListItem>
          <ListItem checked>A completed row</ListItem>
        </List>
        <List ordered>
          <ListItem>A plain number</ListItem>
          <ListItem progress={0.4}>
            The arc rings the number instead of hiding it
          </ListItem>
          <ListItem checked>A completed row replaces the number</ListItem>
        </List>
      </Sample>

      <Sample
        title="Inside prose"
        code="List inside Prose"
        description="A list inside prose reads the prose gap, so it keeps the surrounding rhythm. An explicit gap still wins."
      >
        <Prose>
          <p>
            A list composed inside prose keeps the rhythm without extra props.
          </p>
          <List>
            <ListItem>
              The base gap follows <Code>--prose-gap</Code>
            </ListItem>
            <ListItem>
              An explicit <Code>$gap</Code> still wins, because a variant writes
              an inline style
            </ListItem>
          </List>
          <p>Prose resumes after the list at the same rhythm.</p>
          <List ordered $gap={8}>
            <ListItem>This list asked for a wider gap of its own</ListItem>
            <ListItem>and keeps it inside the prose</ListItem>
          </List>
        </Prose>
      </Sample>

      <Sample
        title="Geometry"
        code="List $gap={1} $itemPadding={0} · $gap={6} · leading-relaxed"
        description="The gap and the item padding drive the spacing. The line height resizes the marker and the gutter with it."
      >
        <List $gap={1} $itemPadding={0}>
          <ListItem>A dense list packs the rows</ListItem>
          <ListItem>
            <Code>$gap</Code> and <Code>$itemPadding</Code> drive the spacing
          </ListItem>
        </List>
        <List $gap={6} className="leading-relaxed">
          <ListItem>A roomy list opens the rows</ListItem>
          <ListItem>
            The line height resizes the marker and the gutter with it
          </ListItem>
        </List>
        <List ordered className="text-lg">
          <ListItem>A larger font grows the chip</ListItem>
          <ListItem>and the gutter beside it</ListItem>
        </List>
      </Sample>

      <Sample
        title="Framed rows"
        code='ListItem $layer $border $rounded="xl" $p={3}'
        description="A row is a frame, so it can paint its own surface and border."
      >
        <List ordered $gap={2}>
          <ListItem $layer $border $rounded="xl" $p={3}>
            <p>
              <strong>A bordered row</strong>
            </p>
            <p>The marker sits inside the row's own padding.</p>
          </ListItem>
          <ListItem $layer $lightnessOffset $rounded="xl" $p={3} checked>
            <p>
              <strong>A lifted, completed row</strong>
            </p>
            <p>The connector still runs between the markers.</p>
          </ListItem>
          <ListItem $layer $border $rounded="xl" $p={3} progress={0.3}>
            <p>
              <strong>In progress</strong>
            </p>
            <p>The last row's segment fades out below its marker.</p>
          </ListItem>
        </List>
      </Sample>

      <Sample
        title="Interactive rows"
        code="li > ListItem render={<Button render={<a />} />}"
        description="A row composed with the button recipe keeps its marker and connector while the button adds the hover and press states."
      >
        <List $gap={0} $itemPadding={1}>
          {[
            {
              label: "A row that composes with the button recipe",
              checked: true,
            },
            {
              label:
                "The item keeps its frame while the button adds the states",
              checked: false,
            },
            { label: "A third row with a progress arc", progress: 0.5 },
          ].map((row) => (
            <li key={row.label}>
              <ListItem
                checked={row.checked}
                progress={row.progress}
                render={
                  <Button
                    render={<a href="#list" />}
                    $p="var(--list-item-padding)"
                    $rounded="xl"
                    $lightnessOffset={false}
                    className="w-full justify-start font-normal text-wrap"
                  />
                }
              >
                {row.label}
              </ListItem>
            </li>
          ))}
        </List>
      </Sample>

      <Sample
        title="Disclosure rows"
        code="li > ListDisclosure button={<ListDisclosureButton checked progress />}"
        description="The connector belongs to the disclosure root, so it runs behind the open content and still reaches the next row."
      >
        <List ordered>
          <li>
            <ListDisclosure
              defaultOpen
              button={
                <ListDisclosureButton checked>
                  Open the first step
                </ListDisclosureButton>
              }
            >
              <p>
                The connector belongs to the disclosure root, so it runs behind
                the open content and still reaches the next row.
              </p>
            </ListDisclosure>
          </li>
          <li>
            <ListDisclosure
              button={
                <ListDisclosureButton progress={0.5}>
                  Open the second step
                </ListDisclosureButton>
              }
            >
              <p>Closed rows keep the same segment as plain rows.</p>
            </ListDisclosure>
          </li>
          <li>
            <ListDisclosure button="A plain label as the button">
              <p>The label goes straight through to the button.</p>
            </ListDisclosure>
          </li>
          <ListItem>
            <p>A plain row closes the list, and its segment fades out.</p>
          </ListItem>
        </List>
      </Sample>

      <Sample
        title="Markers on their own"
        code="ListItemMarker checked · progress"
        description="The marker outside a list stays on the plain layer, since neither list flag is set."
      >
        <div className="flex flex-wrap items-center gap-6">
          <span className="relative inline-block size-[1lh]">
            <ListItemMarker checked />
          </span>
          <span className="relative inline-block size-[1lh]">
            <ListItemMarker checked={false} />
          </span>
          <span className="relative inline-block size-[1lh]">
            <ListItemMarker progress={0.7} />
          </span>
          <Caption>Checked, empty and in progress.</Caption>
        </div>
      </Sample>

      <Sample
        title="On layers"
        code="List inside Layer"
        description="Markers and connectors read the surface around them."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Layer $invert className="grid gap-2 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <List ordered>
              <ListItem>
                <p>A numbered row</p>
              </ListItem>
              <ListItem checked>
                <p>A completed row</p>
              </ListItem>
              <ListItem progress={0.5}>
                <p>A row in progress</p>
              </ListItem>
            </List>
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-4">
            <Caption>Brand</Caption>
            <List>
              <ListItem>A bulleted row</ListItem>
              <ListItem checked>A completed row</ListItem>
              <ListItem checked={false}>An empty slot</ListItem>
            </List>
          </Layer>
        </div>
      </Sample>
    </Samples>
  );
}
