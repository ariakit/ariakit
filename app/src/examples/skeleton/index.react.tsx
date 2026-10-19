import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import {
  Skeleton,
  SkeletonCircle,
  SkeletonFill,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import { RotateCw } from "lucide-react";
import { useRequest } from "./use-request.ts";

const profile = {
  name: "Maya Chen",
  handle: "@maya",
  initials: "MC",
  bio: "Designs accessible interfaces and writes about the web platform. Currently exploring color systems.",
  tags: ["Design systems", "Accessibility", "CSS"],
};

export default function Example() {
  const { data: user, loading, reload } = useRequest(profile);
  return (
    <div className="grid w-md max-w-full gap-3">
      <Frame
        $layer
        $lighten
        $rounded="2xl"
        $border
        $p={6}
        render={<section aria-labelledby="profile-name" aria-busy={loading} />}
        className="grid gap-5 shadow-sm"
      >
        <p role="status" className="sr-only">
          {loading ? "Loading profile" : "Profile loaded"}
        </p>
        <Skeleton loading={loading} className="grid gap-5">
          <div className="flex items-center gap-4">
            <SkeletonCircle className="size-14 shrink-0">
              <Frame
                $layer="brand"
                $rounded="full"
                $forceRounded
                $p="none"
                aria-hidden
                className="grid size-14 shrink-0 place-items-center"
              >
                <span className="text-lg font-semibold">{user?.initials}</span>
              </Frame>
            </SkeletonCircle>
            <div className="grid min-w-0 flex-1">
              <HeadingLevel level={3}>
                <Heading id="profile-name" $level={4}>
                  <SkeletonLine className="w-32">{user?.name}</SkeletonLine>
                </Heading>
              </HeadingLevel>
              <Text className="ak-ink-70 text-sm">
                <SkeletonLine $weight="light" className="w-16">
                  {user?.handle}
                </SkeletonLine>
              </Text>
            </div>
            <SkeletonFill>
              <Button $layer="brand" $kind="bevel">
                Follow
              </Button>
            </SkeletonFill>
          </div>
          <Text render={<p />} className="text-pretty">
            <SkeletonLine className="w-full">{user?.bio}</SkeletonLine>
            <SkeletonLine className="w-3/5" />
          </Text>
          <div className="flex flex-wrap gap-2">
            {(user?.tags ?? profile.tags).map((tag) => (
              <SkeletonFill key={tag}>
                <Badge>
                  <BadgeLabel>{tag}</BadgeLabel>
                </Badge>
              </SkeletonFill>
            ))}
          </div>
        </Skeleton>
      </Frame>
      <Button onClick={reload} className="justify-self-center">
        <ButtonSlot aria-hidden>
          <RotateCw />
        </ButtonSlot>
        <ButtonLabel>Reload profile</ButtonLabel>
      </Button>
    </div>
  );
}
