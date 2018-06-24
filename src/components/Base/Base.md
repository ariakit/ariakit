This is the abstract layout component that all other ReaKit components are built on top of.
By default it renders a `div` tag with basic reset styles.

```jsx static
<Base>Base</Base>
```

```html
<div style="margin: 0; padding: 0; border: 0; font-size: 100%; font-family: inherit; vertical-align: baseline; box-sizing:border-box;">
  Base
</div>
```

Any additional css rules can be added as props.
```jsx
<Base backgroundColor="palevioletred" color="white">Base</Base>
```

It also offers convenience props to control the `position` css property.

```jsx
<Base relative width={100} height={40}>
  <Base absolute backgroundColor="palevioletred" left={0} bottom={0} width={10} height={10} />
</Base>
```

The `as` prop allows you to change the element from a `div` to any other element or react component.

```jsx static
import { Link } from 'react-router-dom';

const Nav = () => (
  <Base as={Link} to="/" fontWeight="bold">React router link to home page</Base>
  <Base as="a" target="_blank">External Link</Base>
)
```