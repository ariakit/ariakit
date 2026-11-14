import * as ak from "@ariakit/react";
import { useMergeRefs } from "@ariakit/react-utils";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { SyntheticEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { avatar, avatarGroup, avatarImage } from "../styles/avatar.ts";

interface LabelProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/** Whether the element has a name for assistive technology. */
function hasLabel(props: LabelProps) {
  if (props["aria-label"] != null) return true;
  return props["aria-labelledby"] != null;
}

export interface AvatarProps
  extends ak.RoleProps<"span">, VariantProps<typeof avatar> {}

/**
 * Returns the props that make an avatar one image with a name, or hide it. An
 * avatar that renders another element, or has its own `role` or `aria-hidden`,
 * keeps what the caller gave it.
 */
function getAvatarImageRoleProps(props: AvatarProps) {
  if (props.render != null) return;
  if (props.role != null) return;
  if (props["aria-hidden"] != null) return;
  if (hasLabel(props)) return { role: "img" } as const;
  return { "aria-hidden": true } as const;
}

/**
 * A round box for a photo, initials, or an icon. It is decorative by default,
 * because the name of the person usually follows it. Pass `aria-label` when the
 * avatar stands alone, and it becomes one image with that name. With `render`
 * or `role`, such as for a link, the avatar keeps the role and the name you
 * give it. In a control, put it in a `box` slot, which sets its size.
 * @example
 * <Avatar>HK</Avatar>
 * @example
 * <Avatar aria-label="Hana Kobayashi" $layer="brand" $size={10}>
 *   <AvatarImage src="/hana.jpg" />
 *   HK
 * </Avatar>
 * @example
 * <Button>
 *   <ButtonSlot $kind="box">
 *     <Avatar>MR</Avatar>
 *   </ButtonSlot>
 *   <ButtonLabel>Maya Rivera</ButtonLabel>
 * </Button>
 */
export function Avatar(props: AvatarProps) {
  const [variantProps, rest] = splitProps(props, avatar);
  return (
    <ak.Role.span
      {...getAvatarImageRoleProps(rest)}
      {...avatar.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface AvatarImageProps
  extends ak.RoleProps<"img">, VariantProps<typeof avatarImage> {}

interface AvatarImageFailure {
  /** The `src` prop of the image that failed. */
  src?: AvatarImageProps["src"];
  /** The `srcSet` prop of the image that failed. */
  srcSet?: AvatarImageProps["srcSet"];
}

/**
 * A photo that covers the avatar. Put the initials or an icon after it in the
 * `Avatar`: they show while the photo loads, and stay when it fails, because
 * the image then removes itself. The image is decorative, so the name goes on
 * the `Avatar`. It renders again when `src` or `srcSet` changes. Pass `render`
 * to use the image component of a framework. `onError` runs only for errors
 * after the page hydrates. An image in the server HTML that fails before that
 * still removes itself, but no event reaches `onError`.
 * @example
 * <Avatar aria-label="Hana Kobayashi">
 *   <AvatarImage src="/hana.jpg" />
 *   HK
 * </Avatar>
 */
export function AvatarImage({ ref, ...props }: AvatarImageProps) {
  const [variantProps, { onError, ...rest }] = splitProps(props, avatarImage);
  const imageRef = useRef<HTMLImageElement>(null);
  const mergedRef = useMergeRefs(ref, imageRef);
  const [failure, setFailure] = useState<AvatarImageFailure | null>(null);
  const { src, srcSet } = rest;
  const failed =
    failure != null && failure.src === src && failure.srcSet === srcSet;

  // An image in the server HTML can fail before React attaches onError, and
  // React does not replay that event. Read the result once the image mounts.
  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    if (!image.complete) return;
    if (image.naturalWidth > 0) return;
    setFailure({ src, srcSet });
  }, [src, srcSet]);

  if (failed) return null;

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    onError?.(event);
    setFailure({ src, srcSet });
  };

  return (
    <ak.Role.img
      ref={mergedRef}
      alt=""
      {...avatarImage.jsx(variantProps)}
      {...rest}
      onError={handleError}
    />
  );
}

export interface AvatarGroupProps
  extends ak.RoleProps<"div">, VariantProps<typeof avatarGroup> {}

/**
 * A row of avatars where each one covers the end of the one before it. `$size`
 * sets the size of all its avatars. For a count of the people that it does not
 * show, add one more `Avatar`. With `aria-label` or `aria-labelledby`, it gets
 * the `group` role.
 * @example
 * <AvatarGroup aria-label="Project members">
 *   <Avatar aria-label="Hana Kobayashi">HK</Avatar>
 *   <Avatar aria-label="Tom Becker">TB</Avatar>
 *   <Avatar aria-label="3 more members">+3</Avatar>
 * </AvatarGroup>
 */
export function AvatarGroup(props: AvatarGroupProps) {
  const [variantProps, rest] = splitProps(props, avatarGroup);
  return (
    <ak.Role.div
      role={hasLabel(rest) ? "group" : undefined}
      {...avatarGroup.jsx(variantProps)}
      {...rest}
    />
  );
}
