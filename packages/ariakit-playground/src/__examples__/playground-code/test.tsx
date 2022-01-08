import { render } from "ariakit-test-utils";
import Example from ".";

test("markup", () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="css-85q7jo code-jsx has-line-numbers"
      >
        <div
          class="cm-editor"
        >
          <pre
            class="cm-scroller"
            style="overflow: auto;"
          >
            <div
              aria-hidden="true"
              class="cm-gutters"
            >
              <div
                class="cm-lineNumbers"
              >
                <div
                  class="cm-gutterElement"
                >
                  1
                </div>
                <div
                  class="cm-gutterElement"
                >
                  2
                </div>
                <div
                  class="cm-gutterElement"
                >
                  3
                </div>
                <div
                  class="cm-gutterElement"
                >
                  4
                </div>
              </div>
            </div>
            <code>
              <span
                class="token keyword"
              >
                function
              </span>
               
              <span
                class="token function"
              >
                Example
              </span>
              <span
                class="token punctuation"
              >
                (
              </span>
              <span
                class="token punctuation"
              >
                )
              </span>
               
              <span
                class="token punctuation"
              >
                {
              </span>
              
      
              <span
                class="token keyword"
              >
                return
              </span>
               
              <span
                class="token tag"
              >
                <span
                  class="token tag"
                >
                  <span
                    class="token punctuation"
                  >
                    &lt;
                  </span>
                  div
                </span>
                <span
                  class="token punctuation"
                >
                  &gt;
                </span>
              </span>
              <span
                class="token plain-text"
              >
                Hello World
              </span>
              <span
                class="token tag"
              >
                <span
                  class="token tag"
                >
                  <span
                    class="token punctuation"
                  >
                    &lt;/
                  </span>
                  div
                </span>
                <span
                  class="token punctuation"
                >
                  &gt;
                </span>
              </span>
              <span
                class="token punctuation"
              >
                ;
              </span>
              

              <span
                class="token punctuation"
              >
                }
              </span>
              

            </code>
          </pre>
        </div>
      </div>
    </div>
  `);
});
