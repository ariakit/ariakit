`reas` components are styled using [styled-components](https://www.styled-components.com).

This is an example of how a component is defined in the library:
```js static
import styled from 'styled-components'
import as, { Base } from 'reas'

const Box = styled(Base)`
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 0.25em;
`

const enhance = as('div')

export default enhance(Box)
```

<br />

Then, you can easily extend `Box` and apply new styles:
```js static
import { Box } from 'reas'

const MyBox = Box.extend`
  background-color: palevioletred;
`
```

But, even if you don't use `styled`, enhancing component with `as` will transform it into a styled component, which means you can still `extend` it.

Another way to style your enhanced components is by passing style props:
```js static
<Box absolute backgroundColor="palevioletred" color="white" />
```

`absolute` is a shorthand for `position="absolute"`. Those styles will be converted into `style={{ ... }}` and applied as inline styles.
