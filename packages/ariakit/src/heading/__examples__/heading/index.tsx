import { Heading, HeadingLevel } from "ariakit/heading";
import "./style.css";

export default function Example() {
  return (
    <HeadingLevel>
      <div className="headingContainer">
        <Heading className="h1">This is heading 1</Heading>
        <HeadingLevel>
          <Heading className="h2">This is heading 2</Heading>
          <HeadingLevel>
            <Heading className="h3">This is heading 3</Heading>
          </HeadingLevel>
        </HeadingLevel>
      </div>
    </HeadingLevel>
  );
}
