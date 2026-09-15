---
"@ariakit/ui": patch
---

Shell layout controls and breakout columns

Each `ShellSidebar` now owns its `$width`, `$collapse`, and `$open` variants. Sidebars collapse below the `3xl` container width by default; use `$collapse={false}` to keep one open at any width. The public sidebar element receives its landmark, styling, and DOM props. Replace disclosure stores and `ShellSidebarToggle` with state and a button that supplies `aria-expanded` and `aria-controls`.

```tsx
const [open, setOpen] = useState(true);

<Button
  aria-expanded={open}
  aria-controls="navigation"
  onClick={() => setOpen(!open)}
>
  Toggle navigation
</Button>
<ShellSidebar id="navigation" render={<nav />} $open={open} $width="md">
  …
</ShellSidebar>
```

`ShellHeader` owns `$height`. Header and footer padding is independent of `ShellMain`'s `$gutter`. The header, footer, and sidebars draw real borders only on the side facing the content. `$border` controls the width, and `$borderType` accepts `"border"`, `"dashed"`, or `"none"`. The shell supplies a configurable radius for nested frames and supports sticky header offsets through three nested shells.

Use `ShellIntro` for a heading above main and `$from="body"` for a sidebar that starts below it. `ShellBreakout` replaces `ShellBleed` with `$span="popout"`, `"feature"`, or `"full"`. Its children use the content column, and a narrower breakout can nest inside a wider one. Keep breakout nesting to two levels.
