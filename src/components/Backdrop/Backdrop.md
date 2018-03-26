```jsx
const { Block, Button, Flex, Hidden } = require('reas');

const Example = () => (
  <Hidden.State>
    {backdrop => (
      <Block>
        <Button as={Hidden.Show} {...backdrop}>Show</Button>
        <Flex height={100} relative>
          <Backdrop absolute as={Hidden.Hide} {...backdrop}>Click me to hide</Backdrop>
        </Flex>
      </Block>
    )}
  </Hidden.State>
);

<Example />
```
