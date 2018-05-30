<!-- Description -->

Image renders by default as an `<img>` tag.
The only css applied is `max-width: 100%`, so the component will fit to parent width and will not stretch beyond its own width.

<!-- Minimal JSX to showcase component -->

```jsx
<Image src="http://www.catster.com/wp-content/uploads/2017/08/A-fluffy-cat-looking-funny-surprised-or-concerned.jpg" />
```

Rendered HTML.

```html
<img class="Image-daFSPM fVKZHS Base-gxTqDr bCPnxv" src="http://www.catster.com/wp-content/uploads/2017/08/A-fluffy-cat-looking-funny-surprised-or-concerned.jpg">
```

<!-- while(not done) { Prop explanation, examples } -->

Basic styling via props.

```jsx
<Image src="http://www.catster.com/wp-content/uploads/2017/08/A-fluffy-cat-looking-funny-surprised-or-concerned.jpg"
width={350}
margin="0 auto"
boxShadow="10px 5px 5px #795546"
/>
```

<!-- Cool styling example -->
