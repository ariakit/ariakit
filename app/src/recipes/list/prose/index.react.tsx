import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";

export default function Example() {
  return (
    <Prose className="w-[36rem] max-w-full">
      <Heading $level={3}>Before the first night out</Heading>
      <p>
        A short trip needs less gear than most people pack. Start with the
        things that keep you <strong>warm and dry</strong>, and add the rest
        only if there is room.
      </p>
      <List>
        <ListItem>A tent with a full rain fly</ListItem>
        <ListItem>
          A sleeping bag rated for the coldest night of the trip
          <List>
            <ListItem>Down is lighter</ListItem>
            <ListItem>Synthetic fill stays warm when it is wet</ListItem>
          </List>
        </ListItem>
        <ListItem>A stove and one pot</ListItem>
      </List>
      <p>Then pitch the tent once at home, in this order:</p>
      <List ordered>
        <ListItem>Lay out the footprint and the tent body</ListItem>
        <ListItem>Join the poles and clip the body to them</ListItem>
        <ListItem>Throw the fly over the top and stake the corners</ListItem>
      </List>
      <p>If that takes more than ten minutes, practice before you leave.</p>
    </Prose>
  );
}
