```js
<Button>Button</Button>
```

```js
<Button disabled>Button</Button>
```

```js
<Button as="a" href="https://reas.js.org" target="_Blank">Go to Website</Button>
```

```js
const FaBeer = require('react-icons/lib/fa/beer');
const { Inline } = require('reas');

<Button><FaBeer /><Inline marginLeft={4}>Beer</Inline></Button>
```

```js
<Button as="select">
  <option>Select</option>
</Button>
```

```js
const { Shadow } = require('reas');

<Button>Button <Shadow /></Button>
```
