<!-- Description -->

Hidden includes [behaviors](#behaviors) and a [container](#containers), accessible as properties in Hidden.
Hidden itself is very generic and simply hides away waiting for an event to show itself and its children.
It is made to be composed with other components in creative ways.

Container

* Hidden.Container

Takes a function as child and works as a wrapper.

Behaviors

* Hidden.Hide
* Hidden.Show
* Hidden.Toggle

Behaviors render as buttons by default.
They modify the visibility of Hidden hiding it, showing it and toggling it, respectively.

See it in action.

<!-- Minimal JSX to showcase component -->

```jsx
const Example = () => (
  <Hidden.Container>
    {hidden => (
      <div>
        <Hidden.Show as={Button} marginRight="1em" {...hidden}>
          Show
        </Hidden.Show>
        <Hidden.Hide as={Button} marginRight="1em" {...hidden}>
          Hide
        </Hidden.Hide>
        <Hidden.Toggle as={Button} {...hidden}>
          Toggle
        </Hidden.Toggle>
        <Hidden as={Inline} {...hidden}>
          ⭐️ 😮️️️ ️️⭐️️
        </Hidden>
      </div>
    )}
  </Hidden.Container>
);

<Example />;
```

Rendered HTML.

```html
<div>
  <div class="Base-gxTqDr bCPnxv Button-kDSBcD eMpnqe Box-cwadsP gAhprV" style="margin-right: 1em;" role="button" tabindex="0">
    Show
  </div>
  <div class="Base-gxTqDr bCPnxv Button-kDSBcD eMpnqe Box-cwadsP gAhprV" style="margin-right: 1em;" role="button" tabindex="0">
    Hide
  </div>
  <div class="Base-gxTqDr bCPnxv Button-kDSBcD eMpnqe Box-cwadsP gAhprV" role="button" tabindex="0">
    Toggle
  </div>
  <span class="Hidden-kQwNaS kWLiGv Base-gxTqDr bCPnxv Inline-dhDjwC cQwXYv" aria-hidden="true" hidden="">
    ⭐️ 😮️️️ ️️⭐️️
  </span>
</div>
```

<!-- Cool styling example -->

Basic styling via props.

```jsx
const Example = () => (
  <Hidden.Container>
    {props => (
      <Flex>
        <Button as={Hidden.Toggle} {...props}>
          Pizza ingredients
        </Button>
        <Hidden absolute transform="translateX(100%)" {...props}>
          <List padding="2em" backgroundColor="bisque">
            <List.Item marginBottom="2em">Cheese</List.Item>
            <List.Item marginBottom="2em">Tomatoes</List.Item>
            <List.Item>Pizza dough</List.Item>
          </List>
        </Hidden>
      </Flex>
    )}
  </Hidden.Container>
);

<Example />;
```

<!-- changing how the element is hidden -->

The `styleProp` property allows you to control how the component will be hidden.

* `display` (default) uses `display: none;`
* `visibility` uses `display: none;`
* `opacity` uses `opacity: 0;`

```jsx static
<div>
  <Hidden visible={false} styleProp="display" />
  <Hidden visible={false} styleProp="visibility" />
  <Hidden visible={false} styleProp="opacity" />
</div>
```

If you want the component to be removed from the DOM entirely you can add the `destroy` prop.

```jsx static
<div className="Container">
  <Hidden visible={false} destroy />
</div>
```

Rendered HTML.

```html
<div class="Container">
</div>
```
