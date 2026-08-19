---
"@ariakit/test": minor
---

Removed the `PointerEvent` fallback

**BREAKING** if your tests, or the code they exercise, reference the `PointerEvent` global, narrow a `pointer*` event with `instanceof MouseEvent`, or read `pageX`, `pageY`, `offsetX`, `offsetY`, or `which` from one, on jsdom below v27, such as the jsdom 26 that `jest-environment-jsdom` 30 depends on.

Importing `@ariakit/test` used to install a `PointerEvent` constructor when the environment had none, which it had done since a time when jsdom implemented no such constructor. jsdom implements it from v27 on, and happy-dom implements it too, so the fallback no longer served the environments it was written for. Environments that implement `PointerEvent` are unaffected.

Where the constructor is missing, the global is now absent again, so building one by hand throws. Dispatch the event by name instead, which reports the same members and works in every environment.

Before:

```ts
await dispatch(q.button(), new PointerEvent("pointerdown", { pointerId: 7 }));
```

After:

```ts
await dispatch.pointerDown(q.button(), { pointerId: 7 });
```

The helpers themselves keep working there, and every event they fire carries the same mouse, modifier, and pointer members it carries anywhere else. `click`, `auxclick`, and `contextmenu` are built from `MouseEvent` there rather than `PointerEvent`, so they keep the computed members too. The `pointer*` events come from `Event`, so `pageX`, `pageY`, `offsetX`, `offsetY`, and `which` are undefined on those. The [readme](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-test/readme.md#test-environment) documents the expected environment.
