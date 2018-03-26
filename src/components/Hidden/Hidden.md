```jsx
const Example = () => (
  <Hidden.State>
    {hidden => (
      <Flex>
        <Group>
          <Hidden.Hide as={Button} {...hidden}>Hide</Hidden.Hide>
          <Hidden.Show as={Button} {...hidden}>Show</Hidden.Show>
          <Hidden.Toggle as={Button} {...hidden}>Toggle</Hidden.Toggle>
        </Group>
        <Hidden {...hidden}>Hidden</Hidden>  
      </Flex>
    )}
  </Hidden.State>
);

<Example />
```
