<!-- Description -->

Image renders by default as an `<img>` tag.
The only css applied is `max-width: 100%`, so the component will fit to parent width and will not stretch beyond its own width.

<!-- Minimal JSX to showcase component -->

```jsx
<Image src="https://placekitten.com/350/" />
```

Rendered HTML.

```html
<img class="Image-daFSPM fVKZHS Base-gxTqDr bCPnxv" src="https://placekitten.com/350/">
```

<!-- while(not done) { Prop explanation, examples } -->

Basic styling via props.

```jsx
<Image src="https://placekitten.com/350/"
width={350}
margin="0 auto"
boxShadow="10px 5px 5px #795546"
/>
```

<!-- Cool styling example -->
