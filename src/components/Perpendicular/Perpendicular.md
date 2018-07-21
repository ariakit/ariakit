Use Perpendicular to position elements relative to one another. Perpendicular positions itself and its children relative to its parent. The parent must have `position` set to something other than `static`, such as `relative`. By default Perpendicular renders as a `<div>`.


```jsx
<Block relative>
  <Button id="foo">Lol</Button>
  <Perpendicular pos="bottom" alignWith="foo" width={20} height={20} background="palevioletred" />
</Block>
```

```jsx
class Lol extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.setRef = ref => {
      this.setState({ ref })
    }
  }

  render() {
    return (
      <Block relative>
        <Button elementRef={this.setRef}>Lol</Button>
        <Perpendicular pos="bottom" alignWith={this.state.ref} width={20} height={20} background="palevioletred" />
      </Block>
    );
  }
}

<Lol />
```


```jsx
import { Block } from "reakit";

<Block
  relative
  margin={50}
  width={10}
  height={10}
  backgroundColor="palevioletred"
>
  <Perpendicular pos="left">pos left</Perpendicular>
</Block>
```

Use the `align` prop to fine tune the position.

```jsx
import { Block } from "reakit";

<Block
  relative
  margin={60}
  width={300}
  height={10}
  backgroundColor="palevioletred"
>
  <Perpendicular pos="top" align="start">
    align start
  </Perpendicular>
  <Perpendicular pos="top" align="center">
    align center
  </Perpendicular>
  <Perpendicular pos="top" align="end">
    align end
  </Perpendicular>
</Block>
```

All combinations of `pos` and `align`.

```jsx
import { Block } from "reakit";

<Block
  relative
  margin={60}
  width={300}
  height={200}
  backgroundColor="palevioletred"
>
  <Perpendicular pos="top" align="start">
    top start
  </Perpendicular>
  <Perpendicular pos="top" align="center">
    top center
  </Perpendicular>
  <Perpendicular pos="top" align="end">
    top end
  </Perpendicular>
  <Perpendicular pos="right" align="start">
    right start
  </Perpendicular>
  <Perpendicular pos="right" align="center">
    right center
  </Perpendicular>
  <Perpendicular pos="right" align="end">
    right end
  </Perpendicular>
  <Perpendicular pos="bottom" align="start">
    bottom start
  </Perpendicular>
  <Perpendicular pos="bottom" align="center">
    bottom center
  </Perpendicular>
  <Perpendicular pos="bottom" align="end">
    bottom end
  </Perpendicular>
  <Perpendicular pos="left" align="start">
    left start
  </Perpendicular>
  <Perpendicular pos="left" align="center">
    left center
  </Perpendicular>
  <Perpendicular pos="left" align="end">
    left end
  </Perpendicular>
</Block>
```

Perpendicular doesn't rotate itself to keep text readable, but the `rotate` prop allows it.

```jsx
import { Block } from "reakit";

<Block
  relative
  margin={60}
  width={300}
  height={200}
  backgroundColor="palevioletred"
>
  <Perpendicular pos="top" align="start" rotate>
    top start
  </Perpendicular>
  <Perpendicular pos="top" align="center" rotate>
    top center
  </Perpendicular>
  <Perpendicular pos="top" align="end" rotate>
    top end
  </Perpendicular>
  <Perpendicular pos="right" align="start" rotate>
    right start
  </Perpendicular>
  <Perpendicular pos="right" align="center" rotate>
    right center
  </Perpendicular>
  <Perpendicular pos="right" align="end" rotate>
    right end
  </Perpendicular>
  <Perpendicular pos="bottom" align="start" rotate>
    bottom start
  </Perpendicular>
  <Perpendicular pos="bottom" align="center" rotate>
    bottom center
  </Perpendicular>
  <Perpendicular pos="bottom" align="end" rotate>
    bottom end
  </Perpendicular>
  <Perpendicular pos="left" align="start" rotate>
    left start
  </Perpendicular>
  <Perpendicular pos="left" align="center" rotate>
    left center
  </Perpendicular>
  <Perpendicular pos="left" align="end" rotate>
    left end
  </Perpendicular>
</Block>
```

Basic styling via props.

```jsx
import { Block } from "reakit";

<InlineBlock relative margin={60}>
  <Perpendicular fontSize="25px" pos="top" align="center">
    🌝
  </Perpendicular>
  <Perpendicular fontSize="8px" pos="right" align="start">
    🚀
  </Perpendicular>
  <Perpendicular pos="bottom" align="start">
    ⭐️
  </Perpendicular>
  <Perpendicular fontSize="12px" pos="left" align="end">
    👽
  </Perpendicular>
  <Inline lineHeight="100%" fontSize="50px">🌏</Inline>
</InlineBlock>
```
