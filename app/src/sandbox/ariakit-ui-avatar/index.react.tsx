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
  Avatar,
  AvatarGroup,
  AvatarImage,
} from "@ariakit/ui/components/avatar.ariakit.react";
import {
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Building2, User } from "lucide-react";
import { useState } from "react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

// A drawn portrait instead of a network image, so the screenshots never wait on
// the network.
const photo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f59e0b'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%23fff7ed'/%3E%3Cpath d='M6 40c2-9 7-13 14-13s12 4 14 13z' fill='%23fff7ed'/%3E%3C/svg%3E";

// Not an image, so the browser reports an error without a network request.
const brokenPhoto = "data:image/png;base64,AAAA";

// A path that the server does not have, so the error comes after a request,
// once the image has mounted.
const missingPhoto = "/ariakit-ui-avatar-missing-photo.png";

// Another path that the server does not have. The retry test serves it after
// the first failure, as when a network error goes away.
const firstPhoto = "/ariakit-ui-avatar-retry-photo.png";

const people = [
  { name: "Hana Kobayashi", initials: "HK", hue: "magenta" },
  { name: "Tom Becker", initials: "TB", hue: "blue" },
  { name: "Rosa Delgado", initials: "RD", hue: "green" },
  { name: "Owen Walsh", initials: "OW", hue: "orange" },
] as const;

function PhotoSource() {
  const [presses, setPresses] = useState(0);
  const broken = presses % 2 === 0;
  // Each press gives the missing source a new URL, so each one is a source that
  // the image has not tried. The Photo retry example covers a source that comes
  // back.
  const src = broken ? `${missingPhoto}?${presses}` : photo;
  return (
    <div className="flex items-center gap-3">
      <Avatar aria-label="Maya Rivera" $layer="brand">
        <AvatarImage src={src} />
        MR
      </Avatar>
      <Button aria-pressed={!broken} onClick={() => setPresses(presses + 1)}>
        Working photo
      </Button>
    </div>
  );
}

function PhotoRetry() {
  const [other, setOther] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <Avatar aria-label="Rosa Delgado" $layer="brand" $hue="green">
        <AvatarImage src={other ? photo : firstPhoto} />
        RD
      </Avatar>
      <Button aria-pressed={other} onClick={() => setOther(!other)}>
        Other photo
      </Button>
    </div>
  );
}

function PhotoSourceSet() {
  const [broken, setBroken] = useState(true);
  // A srcset candidate ends at the first space, so encode the spaces.
  const candidate = broken ? missingPhoto : photo.replaceAll(" ", "%20");
  return (
    <div className="flex items-center gap-3">
      <Avatar aria-label="Owen Walsh" $layer="brand" $hue="orange">
        <AvatarImage srcSet={`${candidate} 1x`} />
        OW
      </Avatar>
      <Button aria-pressed={!broken} onClick={() => setBroken(!broken)}>
        Working photo set
      </Button>
    </div>
  );
}

export default function AvatarExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Default"
        description="A neutral avatar that lifts off the surface under it. It is two lines of text tall, and it is hidden from assistive technology, because the name follows it."
        code={`
          <Avatar>HK</Avatar>
          <span>Hana Kobayashi</span>
        `}
      >
        <div className="flex items-center gap-3">
          <Avatar>HK</Avatar>
          <span>Hana Kobayashi</span>
        </div>
      </Example>

      <Example
        title="Sizes"
        description="A number scales the spacing token, so the avatar follows the font size. A string is a CSS length. The initials scale with the avatar."
        code={`
          <Avatar $size={6}>HK</Avatar>
          <Avatar $size={8}>HK</Avatar>
          <Avatar $size={10}>HK</Avatar>
          <Avatar $size={14}>HK</Avatar>
          <Avatar $size="1lh">HK</Avatar>
          <Avatar $size="4rem">HK</Avatar>
        `}
      >
        <Avatar $size={6}>HK</Avatar>
        <Avatar $size={8}>HK</Avatar>
        <Avatar $size={10}>HK</Avatar>
        <Avatar $size={14}>HK</Avatar>
        <Avatar $size="1lh">HK</Avatar>
        <Avatar $size="4rem">HK</Avatar>
      </Example>

      <Example
        title="Size follows text"
        description="The default size is two lines of the text around the avatar, and a number is a multiple of a quarter of its font size."
        code={`
          <p className="text-xs"><Avatar>HK</Avatar></p>
          <p className="text-xl"><Avatar>HK</Avatar></p>
          <p className="text-xl"><Avatar $size={8}>HK</Avatar></p>
        `}
      >
        <p className="text-xs">
          <Avatar>HK</Avatar>
        </p>
        <p className="text-xl">
          <Avatar>HK</Avatar>
        </p>
        <p className="text-xl">
          <Avatar $size={8}>HK</Avatar>
        </p>
      </Example>

      <Example
        title="Initials"
        description="One letter, two wide letters and a short count fit the avatar at the same size."
        code={`
          <Avatar>J</Avatar>
          <Avatar>WW</Avatar>
          <Avatar>+12</Avatar>
        `}
      >
        <Avatar>J</Avatar>
        <Avatar>WW</Avatar>
        <Avatar>+12</Avatar>
      </Example>

      <Example
        title="Colors"
        description="A layer color fills the avatar, and a hue changes that color."
        code={`
          <Avatar>HK</Avatar>
          <Avatar $layer="brand">HK</Avatar>
          <Avatar $layer="brand" $hue="green">HK</Avatar>
          <Avatar $layer="brand" $hue="magenta">HK</Avatar>
          <Avatar $layer="secondary">HK</Avatar>
        `}
      >
        <Avatar>HK</Avatar>
        <Avatar $layer="brand">HK</Avatar>
        <Avatar $layer="brand" $hue="green">
          HK
        </Avatar>
        <Avatar $layer="brand" $hue="magenta">
          HK
        </Avatar>
        <Avatar $layer="secondary">HK</Avatar>
      </Example>

      <Example
        title="Shapes and icons"
        description="A radius step makes a rounded square, such as for a team or a workspace. An icon takes half of the avatar."
        code={`
          <Avatar><User /></Avatar>
          <Avatar $rounded="lg" $layer="brand"><Building2 /></Avatar>
          <Avatar $rounded="md">A</Avatar>
        `}
      >
        <Avatar>
          <User />
        </Avatar>
        <Avatar $rounded="lg" $layer="brand">
          <Building2 />
        </Avatar>
        <Avatar $rounded="md">A</Avatar>
      </Example>

      <Example
        title="Photo"
        description="The photo covers the initials and takes the corners of the avatar."
        code={`
          <Avatar aria-label="Maya Rivera">
            <AvatarImage src={photo} />
            MR
          </Avatar>
          <Avatar aria-label="Acme" $rounded="lg" $size={14}>
            <AvatarImage src={photo} />
            A
          </Avatar>
        `}
      >
        <Avatar aria-label="Maya Rivera">
          <AvatarImage src={photo} />
          MR
        </Avatar>
        <Avatar aria-label="Acme" $rounded="lg" $size={14}>
          <AvatarImage src={photo} />A
        </Avatar>
      </Example>

      <Example
        title="Failed photo"
        description="The photo fails to load, so the image removes itself and the initials stay."
        code={`
          <Avatar aria-label="Noah Patel" $layer="brand">
            <AvatarImage src={brokenPhoto} />
            NP
          </Avatar>
        `}
      >
        <Avatar aria-label="Noah Patel" $layer="brand">
          <AvatarImage src={brokenPhoto} />
          NP
        </Avatar>
      </Example>

      <Example
        title="Photo source"
        description="The server does not have the first photo, so it fails after a request. The button gives the image a working source, and the photo shows. Press it again for a new missing source, which fails after the image mounts."
        code={`
          <Avatar aria-label="Maya Rivera" $layer="brand">
            <AvatarImage src={src} />
            MR
          </Avatar>
        `}
      >
        <PhotoSource />
      </Example>

      <Example
        title="Photo source set"
        description="An image with only srcSet fails like one with src. The button gives it a working source set, and the photo shows."
        code={`
          <Avatar aria-label="Owen Walsh" $layer="brand" $hue="orange">
            <AvatarImage srcSet={srcSet} />
            OW
          </Avatar>
        `}
      >
        <PhotoSourceSet />
      </Example>

      <Example
        title="Photo retry"
        description="The first photo fails. The button shows another photo, and when it switches back, the image tries the first photo again, so it shows if the error went away."
        code={`
          <Avatar aria-label="Rosa Delgado" $layer="brand" $hue="green">
            <AvatarImage src={other ? photo : firstPhoto} />
            RD
          </Avatar>
        `}
      >
        <PhotoRetry />
      </Example>

      <Example
        title="Labelled avatar"
        description="An avatar that stands alone gets its name from aria-label, and it becomes one image."
        code={`
          <Avatar aria-label="Hana Kobayashi" $layer="brand">HK</Avatar>
        `}
      >
        <Avatar aria-label="Hana Kobayashi" $layer="brand">
          HK
        </Avatar>
      </Example>

      <Example
        title="Link avatar"
        description="An avatar that renders a link keeps the link role, and the label names the link. $focus adds the focus ring."
        code={`
          <Avatar
            render={<a href="#hana" />}
            aria-label="Hana Kobayashi"
            $layer="brand"
            $focus
            $focusOffset={2}
          >
            HK
          </Avatar>
        `}
      >
        <Avatar
          // Safari needs the explicit tab index to focus a link with Tab.
          render={<a href="#hana" tabIndex={0} />}
          aria-label="Hana Kobayashi"
          $layer="brand"
          $focus
          $focusOffset={2}
        >
          HK
        </Avatar>
      </Example>

      <Example
        title="In running text"
        description="An avatar of one line fits in a sentence without making the line taller."
        code={`
          <p>
            Assigned to <Avatar $size="1lh" $layer="brand">HK</Avatar> Hana
          </p>
        `}
      >
        <p>
          Assigned to{" "}
          <Avatar $size="1lh" $layer="brand">
            HK
          </Avatar>{" "}
          Hana
        </p>
      </Example>

      <Example
        title="In a control"
        description="In a box slot, the slot height sets the size of the avatar, so the slot size changes it."
        code={`
          <Button>
            <ButtonSlot $kind="box">
              <Avatar $layer="brand">MR</Avatar>
            </ButtonSlot>
            <ButtonLabel>Maya Rivera</ButtonLabel>
          </Button>
          <Button>
            <ButtonSlot $kind="box" $size="full">
              <Avatar $layer="brand">NP</Avatar>
            </ButtonSlot>
            <ButtonLabel>Noah Patel</ButtonLabel>
          </Button>
        `}
      >
        <Button>
          <ButtonSlot $kind="box">
            <Avatar $layer="brand">MR</Avatar>
          </ButtonSlot>
          <ButtonLabel>Maya Rivera</ButtonLabel>
        </Button>
        <Button>
          <ButtonSlot $kind="box" $size="full">
            <Avatar $layer="brand">NP</Avatar>
          </ButtonSlot>
          <ButtonLabel>Noah Patel</ButtonLabel>
        </Button>
      </Example>

      <Example
        title="Group"
        description="Each avatar covers the end of the one before it, with a ring in the color of the surface around the group. The count is one more avatar."
        code={`
          <AvatarGroup aria-label="Project members">
            <Avatar aria-label="Hana Kobayashi" $layer="brand" $hue="magenta">HK</Avatar>
            …
            <Avatar aria-label="3 more members">+3</Avatar>
          </AvatarGroup>
        `}
      >
        <AvatarGroup aria-label="Project members">
          {people.map((person) => (
            <Avatar
              key={person.name}
              aria-label={person.name}
              $layer="brand"
              $hue={person.hue}
            >
              {person.initials}
            </Avatar>
          ))}
          <Avatar aria-label="3 more members">+3</Avatar>
        </AvatarGroup>
      </Example>

      <Example
        title="Group sizes"
        description="The group sets the size of its avatars. An avatar with its own size keeps it."
        code={`
          <AvatarGroup $size={7}>…</AvatarGroup>
          <AvatarGroup $size={14}>…</AvatarGroup>
          <AvatarGroup $size={8}>
            <Avatar>HK</Avatar>
            <Avatar $size={12}>TB</Avatar>
          </AvatarGroup>
        `}
      >
        <AvatarGroup aria-label="Small group" $size={7}>
          {people.map((person) => (
            <Avatar key={person.name} $layer="brand" $hue={person.hue}>
              {person.initials}
            </Avatar>
          ))}
        </AvatarGroup>
        <AvatarGroup aria-label="Large group" $size={14}>
          {people.map((person) => (
            <Avatar key={person.name} $layer="brand" $hue={person.hue}>
              {person.initials}
            </Avatar>
          ))}
        </AvatarGroup>
        <AvatarGroup
          aria-label="Mixed group"
          $size={8}
          className="items-center"
        >
          <Avatar>HK</Avatar>
          <Avatar $size={12}>TB</Avatar>
        </AvatarGroup>
      </Example>

      <Example
        title="Group on a colored surface"
        description="The ring takes the color of the surface around the group, also on a colored frame."
        code={`
          <Frame $layer="brand" $p={4} $rounded="xl">
            <AvatarGroup>…</AvatarGroup>
          </Frame>
        `}
      >
        <Frame $layer="brand" $p={4} $rounded="xl">
          <AvatarGroup aria-label="Members on brand">
            {people.map((person) => (
              <Avatar key={person.name}>{person.initials}</Avatar>
            ))}
          </AvatarGroup>
        </Frame>
      </Example>

      <Example
        title="Group with bordered avatars"
        description="A border, also one inherited from a frame, stays on the edge of each avatar, inside the ring in the color of the surface."
        code={`
          <AvatarGroup>
            <Avatar $border>HK</Avatar>
            <Avatar $border>TB</Avatar>
          </AvatarGroup>
          <Frame $border $p={2} $rounded="xl">
            <AvatarGroup>
              <Avatar $border="inherit">HK</Avatar>
              <Avatar $border="inherit">TB</Avatar>
            </AvatarGroup>
          </Frame>
        `}
      >
        <div className="flex flex-wrap items-center gap-4">
          <AvatarGroup aria-label="Bordered members">
            {people.map((person) => (
              <Avatar key={person.name} $border>
                {person.initials}
              </Avatar>
            ))}
          </AvatarGroup>
          <Frame $border $p={2} $rounded="xl">
            <AvatarGroup aria-label="Members with inherited borders">
              {people.map((person) => (
                <Avatar key={person.name} $border="inherit">
                  {person.initials}
                </Avatar>
              ))}
            </AvatarGroup>
          </Frame>
        </div>
      </Example>

      <Example
        title="Group with wrapped avatars"
        description="An element around each avatar, such as a tooltip anchor, takes the overlap, and the avatar keeps the ring."
        code={`
          <AvatarGroup>
            <span><Avatar>HK</Avatar></span>
            <span><Avatar>TB</Avatar></span>
          </AvatarGroup>
        `}
      >
        <AvatarGroup aria-label="Wrapped members">
          {people.map((person) => (
            <span key={person.name} className="flex">
              <Avatar $layer="brand" $hue={person.hue}>
                {person.initials}
              </Avatar>
            </span>
          ))}
        </AvatarGroup>
      </Example>

      <Example
        title="Group of links"
        description="Each link avatar gets its focus ring over the next avatar."
        code={`
          <AvatarGroup aria-label="Linked members">
            <Avatar render={<a href="#hana" />} aria-label="Hana Kobayashi" $focus>
              HK
            </Avatar>
            …
          </AvatarGroup>
        `}
      >
        <AvatarGroup aria-label="Linked members">
          {people.map((person) => (
            <Avatar
              key={person.name}
              render={<a href={`#${person.initials}`} tabIndex={0} />}
              aria-label={person.name}
              $layer="brand"
              $hue={person.hue}
              $focus
              $focusOffset={2}
            >
              {person.initials}
            </Avatar>
          ))}
        </AvatarGroup>
      </Example>

      <Example
        title="Group in right-to-left text"
        description="The overlap follows the text direction."
        code={`
          <AvatarGroup dir="rtl">…</AvatarGroup>
        `}
      >
        <AvatarGroup aria-label="Right-to-left members" dir="rtl">
          {people.map((person) => (
            <Avatar key={person.name} $layer="brand" $hue={person.hue}>
              {person.initials}
            </Avatar>
          ))}
        </AvatarGroup>
      </Example>
    </ExampleGrid>
  );
}
