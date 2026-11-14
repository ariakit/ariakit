import { Avatar } from "@ariakit/ui/components/avatar.ariakit.react";

export default function Example() {
  return (
    <div className="grid w-80 max-w-full gap-6">
      <div className="flex items-center gap-4 text-xl">
        {/*
         * A number is a count of spacing steps, which follow the font size.
         */}
        <Avatar $layer="brand" $hue="magenta" $size={14}>
          HK
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-semibold">Hana Kobayashi</p>
          <p className="ak-ink-70 truncate text-sm">Design lead</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        {/* The default size is two lines of the text around the avatar. */}
        <Avatar $layer="brand" $hue="blue">
          TB
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium">Tom Becker</p>
          <p className="ak-ink-70 truncate">Commented 2 hours ago</p>
        </div>
      </div>
      <p className="text-sm">
        Assigned to{" "}
        {/* One line of text, so the avatar fits in the sentence. */}
        <Avatar $layer="brand" $hue="green" $size="1lh">
          RD
        </Avatar>{" "}
        <span className="font-medium">Rosa Delgado</span>
      </p>
    </div>
  );
}
