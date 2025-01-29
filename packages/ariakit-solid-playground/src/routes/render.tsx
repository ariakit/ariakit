import { As, Role } from "@ariakit/solid";
import { createSignal } from "solid-js";
import "./render.css";

export default function Render() {
  const [dynamic, setDynamic] = createSignal(true);
  return (
    <>
      <h1>LEGEND (color by tag)</h1>
      <p>p</p>
      <span>span</span>
      <button>button</button>
      <h1>EXAMPLES</h1>
      <h2>Render with "As"</h2>
      <Role.span>span</Role.span>
      <Role.span render={<As.button />}>
        span (with children) + button
      </Role.span>
      <Role.span
        render={<As.button>span + button (with children)</As.button>}
      />
      <Role.span
        render={
          <As.button>
            if you're reading this, it worked (children override)
          </As.button>
        }
      >
        this shouldn't be visible
      </Role.span>
      <Role.span
        data-test="if you're reading this, it worked"
        render={
          <As.button data-test={undefined}>
            data-test: undefined (inspect me)
          </As.button>
        }
      />
      <Role.button>button</Role.button>
      <Role.button render={<As.span>button + span</As.span>} />
      <h2>Render with "As" - class merging</h2>
      <Role.button class="a" render={<As.button class="a" />}>
        (i should have ".a")
      </Role.button>
      <Role.button render={<As.button class="b" />}>
        (i should have ".b")
      </Role.button>
      <Role.button class="a" render={<As.button class="b" />}>
        (i should have ".a" and ".b")
      </Role.button>
      <h2>Render with "As" - reactive tag (click to toggle)</h2>
      <Role.button
        onClick={() => setDynamic((value) => !value)}
        render={
          dynamic() ? <As.span>button + span</As.span> : <As.p>button + p</As.p>
        }
      />
      <h2>Render with function</h2>
      <Role.div
        data-test="a"
        render={(props) => (
          <button
            type="button"
            {...props}
            // @ts-expect-error TODO: declaration below is not working
            data-test={`${props["data-test"]} + b`}
          />
        )}
      >
        I should be a button with type="button" and data-test="a + b"
      </Role.div>
    </>
  );
}

// TODO: this is not working
declare module "solid-js" {
  namespace JSX {
    interface HTMLAttributes<T> {
      [key: `data-${string}`]: string;
    }
  }
}
