<!-- Description -->

This component consists of Base with `display: flex`.
Several flex properties can be passed directly as props for convenience.
`Flex-direction` defaults to `row`.

<!-- Minimal JSX to showcase component -->

```jsx
const { Paragraph } = require("reakit");

<Flex>
  <Paragraph marginRight="1em">
    Aliqua tempor adipisicing dolor Lorem ut aliqua nostrud esse. Ex esse sunt
    irure aliqua dolor labore. Ad nostrud esse qui duis dolore in aliquip. Esse
    velit laborum magna duis ad magna commodo qui laboris in duis incididunt
    laboris.
  </Paragraph>
  <Paragraph>
    Deserunt occaecat consectetur id aliquip aliqua mollit ipsum laborum in
    fugiat dolor reprehenderit.
  </Paragraph>
</Flex>;
```

Rendered HTML.

```html
<div class="Flex-kFpfAw hwskqf Base-gxTqDr bCPnxv">
  <p class="Paragraph-hHEPzZ gGuRi Base-gxTqDr bCPnxv" style="margin-right: 1em;">
    Aliqua tempor adipisicing dolor Lorem ut aliqua nostrud esse. Ex esse sunt irure aliqua dolor labore.
    Ad nostrud esse qui duis dolore in aliquip.
    Esse velit laborum magna duis ad magna commodo qui laboris in duis incididunt laboris.
  </p>
  <p class="Paragraph-hHEPzZ gGuRi Base-gxTqDr bCPnxv">
    Deserunt occaecat consectetur id aliquip aliqua mollit ipsum laborum in fugiat dolor reprehenderit.
  </p>
</div>
```

`rowReverse` on parent Flex and `flex` on flex items.

```jsx
const { Box } = require("reakit");

<Flex rowReverse>
  <Box flex={1} height="50px">
    1
  </Box>
  <Box flex={2} height="50px">
    2
  </Box>
  <Box flex={3} height="50px">
    3
  </Box>
  <Box height="50px">4</Box>
</Flex>;
```

<!-- Cool styling example -->

Basic styling via props to create columns.

```jsx
const { Paragraph } = require("reakit");

<Flex>
  <Paragraph flex={2} marginRight="1em" backgroundColor="#eee" color="#666">
    Enim deserunt dolor consequat adipisicing. Ea duis in mollit ullamco anim
    Lorem Lorem laborum excepteur veniam do commodo. Nulla in ipsum consequat in
    ipsum consequat.
  </Paragraph>
  <Paragraph flex={1} marginRight="1em" backgroundColor="#ddd" color="#888">
    Lorem tempor et nulla in commodo. Sunt amet veniam voluptate eu ut deserunt
    Lorem quis nulla culpa duis ea consequat do proident veniam id. Consectetur
    elit adipisicing ipsum id culpa.
  </Paragraph>
  <Paragraph flex={1} backgroundColor="#ccc" color="#999">
    Ullamco enim commodo tempor esse. Exercitation voluptate eiusmod eiusmod
    occaecat exercitation nostrud mollit laboris occaecat. Exercitation enim
    sunt commodo Lorem ullamco.
  </Paragraph>
</Flex>;
```
