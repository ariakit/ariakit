<!-- Description -->


A Card can be used to serve related information together such as Actions, image, text, etc.
Card is Base with `display: inline-block`, small padding and a box shadow.
By default it renders as a `<div>`.

<!-- Minimal JSX to showcase component -->

```jsx
<Card>
  <Heading as="h4">Card Heading</Heading>
  <Paragraph>Description for Card</Paragraph>
</Card>
```

Rendered HTML.

```html
<div class="Card-RQot gVanYl Base-gxTqDr bCPnxv">
  <h1 class="Base-gxTqDr bCPnxv Heading-gqIVUu fgNjay">Card Heading</h1>
  <p class="Base-gxTqDr bCPnxv Paragraph-hHEPzZ gGuRi">Description for Card</p>
</div>
```

<!-- while(not done) { Prop explanation, examples } -->

Basic styling via props.

```jsx
const { Grid } = require("reas");

<Grid column gap={20} justifyContent="start">
  <Card width={300}>
    <Heading as="h4">First Card</Heading>
    <Paragraph>First Card Description</Paragraph>
    <Image src="http://www.catster.com/wp-content/uploads/2017/08/A-fluffy-cat-looking-funny-surprised-or-concerned.jpg" />
  </Card>
  <Card>
    <Heading as="h3">Second Card</Heading>
    <Paragraph>Second Card Description</Paragraph>
    <Button>Action 1</Button>
    <Button>Action 2</Button>
  </Card>
</Grid>
```

<!-- Cool styling example -->
