A Card can be used to serve related information together such as actions, image, text etc.

```jsx
import { Heading, Image, Paragraph, Card } from "reakit";

<Card>
  <Heading as="h3">Card Heading</Heading>
  <Card.Fit
    as={Image}
    src="https://placekitten.com/300/300"
    alt="Kitten"
    width={300}
    height={300}
  />
  <Paragraph>Description for Card</Paragraph>
</Card>
```

```jsx
const { Grid, Image, Heading, Paragraph, Card } = require("reakit");

<Grid column autoColumns="minmax(min-content, max-content)" gap={20} alignItems="start">
  <Card>
    <Heading as="h3">Card Heading</Heading>
    <Card.Fit
      as={Image}
      src="https://placekitten.com/200/300"
      alt="Kitten"
      width={200}
      height={300}
    />
    <Paragraph>Description for Card</Paragraph>
  </Card>
  <Card>
    <Card.Fit
      as={Image}
      src="https://placekitten.com/300/200"
      alt="Kitten"
      width={300}
      height={200}
    />
    <Heading as="h3">Card Heading</Heading>
    <Paragraph>Description for Card</Paragraph>
  </Card>
</Grid>
```
