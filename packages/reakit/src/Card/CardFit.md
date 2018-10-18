You can use `CardFit` to bypass the `gutter` prop on [Card](../Card/Card.md):

```jsx
import { Card } from 'reakit';

<Card>
  <div>This has some spacing around</div>
  <Card.Fit>This doesn't</Card.Fit>
</Card>
```
