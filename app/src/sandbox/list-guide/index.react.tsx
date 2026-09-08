import {
  List,
  ListDisclosure,
  ListItem,
} from "@ariakit/ui/components/list.ariakit.react.tsx";

function Step({ title, body }: { title: string; body: string }) {
  return (
    <ListItem>
      <p>
        <strong>{title}</strong>
      </p>
      <p>{body}</p>
    </ListItem>
  );
}

export default function Example() {
  return (
    <div className="grid w-96 gap-8 p-4">
      <List ordered aria-label="Steps">
        <Step title="Install" body="A numbered list in blocks mode." />
        <Step title="Configure" body="The guide joins the numbers." />
        <Step title="Review" body="The last segment fades out." />
      </List>
      <List aria-label="Plain">
        <ListItem>An unordered list dashes its rows</ListItem>
        <ListItem>and draws no guide on its own</ListItem>
      </List>
      <List $guide $gap={6} aria-label="Timeline">
        <ListItem>
          Asked for a guide, an unordered list bullets its rows
        </ListItem>
        <ListItem>and joins the bullets</ListItem>
        <ListItem checked>A check slot sits on the same guide</ListItem>
      </List>
      <List ordered $guide={false} aria-label="No guide">
        <Step title="Numbered" body="This list turned its guide off." />
        <Step title="Blocks" body="The rhythm stays the same." />
      </List>
      <List ordered aria-label="Steps with details">
        <li>
          <ListDisclosure button="Show details">
            <p>The guide spans the open content and reaches the next row.</p>
            <p>It follows the content as it opens.</p>
          </ListDisclosure>
        </li>
        <Step title="Next step" body="A plain row after the disclosure." />
      </List>
      <div dir="rtl">
        <List ordered aria-label="Right to left">
          <Step title="First" body="The marker column mirrors." />
          <Step title="Second" body="The guide stays under the markers." />
        </List>
      </div>
    </div>
  );
}
