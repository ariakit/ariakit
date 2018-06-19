`as` is the base method of ReaKit. Understanding how it works is all you need to start using the library.

The first usage of `as` is enhancing components. With that, you can take advantage of all ReaKit features on any component.

```jsx static
import React from 'react'
import as from 'reakit'

const MyComponent = ({ as: T, ...props }) => <T {...props} />

const enhance = as('span')

export default enhance(MyComponent)
```

<br />
The second way is by calling `as` from an enhanced component. Thus, you can combine it with any other component. This is specially useful when you need to apply [behaviors](#behaviors) to your components.

```jsx static
import { Hidden } from 'reakit'
import { Link } from 'react-router-dom'
import MyComponent from './MyComponent'

const MyComponentDiv = MyComponent.as('div')
const MyComponentLink = MyComponent.as(Link)
const MyComponentToggleLink = MyComponent.as([Hidden.Toggle, Link])
const MyComponentToggleLinkDiv = MyComponent.as([Hidden.Toggle, Link, 'div'])
```

<br />
Finally, you can use it as a prop on the enhanced component.

```jsx static
import { Hidden } from 'reakit'
import { Link } from 'react-router-dom'
import MyComponent from './MyComponent'

const AnotherComponent = () => (
  <MyComponent as={[Hidden.Toggle, Link, 'div']} />
)
```
