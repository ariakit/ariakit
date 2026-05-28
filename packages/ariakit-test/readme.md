# Ariakit Test

**Important:** This package is experimental and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions.

## Installation

```
npm i @ariakit/test
```

## Core Team

- [Diego Haz](https://bsky.app/profile/haz.dev)
- [Ben Rodri](https://bsky.app/profile/ben.ariakit.org)
- [Dani Guardiola](https://bsky.app/profile/dio.la)

## Contributing

Follow the instructions on the [contributing guide](https://github.com/ariakit/ariakit/blob/main/contributing.md).

<!-- ariakit-docs:start -->

## API reference

#### `blur`

```ts
function blur(element?: DirtiableElement | null): Promise<void>;
```

#### `click`

```ts
function click(
  element: Element | null,
  options?: PointerEventInit,
  tap = false,
): Promise<void>;
```

#### `dispatch`

```ts
type Target = Document | Window | Node | Element | null;

type EventFunction = (element: Target, options?: object) => Promise<boolean>;

type EventsObject = {
  [K in EventType]: EventFunction;
};

const dispatch: typeof baseDispatch & EventsObject;
```

#### `focus`

```ts
function focus(element: Element | null): Promise<void>;
```

#### `hover`

```ts
function hover(
  element: Element | null,
  options?: PointerEventInit,
): Promise<void>;
```

#### `mouseDown`

```ts
function mouseDown(
  element: Element | null,
  options?: PointerEventInit,
): Promise<void>;
```

#### `mouseUp`

```ts
function mouseUp(
  element: Element | null,
  options?: PointerEventInit,
): Promise<void>;
```

#### `press`

```ts
function press(
  key: string,
  element?: Element | null,
  options: KeyboardEventInit = {},
): Promise<void>;
```

#### `query`

```ts
type Query = ReturnType<typeof createRoleQuery>;

type TextQuery = ReturnType<typeof createTextQuery>;

type LabeledQuery = ReturnType<typeof createLabeledQuery>;

type RoleQueries = Record<AriaRole, Query>;

interface QueryObject extends RoleQueries {
  text: TextQuery;
  labeled: LabeledQuery;
  within: (element?: HTMLElement | null) => QueryObject;
}

const query: QueryObject;
```

#### `q`

```ts
type Query = ReturnType<typeof createRoleQuery>;

type TextQuery = ReturnType<typeof createTextQuery>;

type LabeledQuery = ReturnType<typeof createLabeledQuery>;

type RoleQueries = Record<AriaRole, Query>;

interface QueryObject extends RoleQueries {
  text: TextQuery;
  labeled: LabeledQuery;
  within: (element?: HTMLElement | null) => QueryObject;
}

const q: QueryObject;
```

#### `select`

```ts
function select(
  text: string,
  element: Element | null = document.body,
  options?: PointerEventInit,
): Promise<void>;
```

#### `sleep`

```ts
function sleep(ms = defaultMs): Promise<void>;
```

#### `tap`

```ts
function tap(
  element: Element | null,
  options?: PointerEventInit,
): Promise<void>;
```

#### `type`

```ts
function type(
  text: string,
  element?: (DirtiableElement & HTMLElement) | null,
  options: InputEventInit | KeyboardEventInit = {},
): Promise<void>;
```

#### `waitFor`

```ts
function waitFor<T>(
  callback: () => T,
  options?: DOMTestingLibrary.waitForOptions,
): Promise<T>;
```

<!-- ariakit-docs:end -->

<!-- ariakit-docs:start react -->

## React API reference

#### `RenderOptions`

```ts
interface RenderOptions extends Omit<
  ReactTestingLibrary.RenderOptions,
  "queries"
> {
  strictMode?: boolean;
}
```

#### `render`

```ts
function render(
  ui: ReactNode,
  options?: RenderOptions,
): Promise<{
  unmount: () => void;
  rerender: (newUi: ReactNode) => Promise<void>;
}>;
```

<!-- ariakit-docs:end react -->

<!-- ariakit-docs:start playwright -->

## Playwright API reference

#### `query`

```ts
type RoleQuery = (
  name?: string | RegExp,
  options?: Parameters<Page["getByRole"]>[1],
) => Locator;

type TextQuery = (
  name: Parameters<Page["getByText"]>[0],
  options?: Parameters<Page["getByText"]>[1],
) => Locator;

type RoleQueries = Record<AriaRole, RoleQuery>;

type Queries = RoleQueries & { text: TextQuery };

function query(locator: Page | Locator | FrameLocator): Queries;
```

<!-- ariakit-docs:end playwright -->
