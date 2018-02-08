```jsx
const { Block, Button, Flex, Hidden, withHiddenState } = require('reas');

const enhance = withHiddenState('backdrop');
const Example = enhance(({ backdrop }) => (
  <Block>
    <Button as={Hidden.Show} {...backdrop}>Show</Button>
    <Flex height={100} relative>
      <Backdrop absolute as={Hidden.Hide} {...backdrop}>Click me to hide</Backdrop>
    </Flex>
  </Block>
));

<Example />
```
