import { render } from "ariakit-test";
import Example from ".";

test("markup", () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="playground"
      >
        <div
          aria-describedby=":r0:"
          aria-label="index.js"
          class="css-lnm415 code-jsx has-line-numbers editor"
          data-command=""
          role="group"
          tabindex="0"
        >
          <div
            class="cm-editor ͼ1 ͼ2 ͼ4 ͼo"
          >
            <div
              aria-live="polite"
              style="position: absolute; top: -10000px;"
            />
            <div
              class="cm-scroller"
              tabindex="-1"
            >
              <div
                aria-hidden="true"
                class="cm-gutters"
                style="min-height: 56px; position: sticky;"
              >
                <div
                  class="cm-gutter cm-lineNumbers"
                >
                  <div
                    class="cm-gutterElement"
                    style="height: 0px; visibility: hidden; pointer-events: none;"
                  >
                    9
                  </div>
                  <div
                    class="cm-gutterElement cm-activeLineGutter"
                    style="height: 14px;"
                  >
                    1
                  </div>
                  <div
                    class="cm-gutterElement"
                    style="height: 14px;"
                  >
                    2
                  </div>
                  <div
                    class="cm-gutterElement"
                    style="height: 14px;"
                  >
                    3
                  </div>
                  <div
                    class="cm-gutterElement"
                    style="height: 14px;"
                  >
                    4
                  </div>
                </div>
              </div>
              <div
                aria-label="index.js"
                aria-multiline="true"
                autocapitalize="off"
                autocorrect="off"
                class="cm-content"
                contenteditable="true"
                role="textbox"
                spellcheck="false"
                style="tab-size: 4;padding-bottom: -14px"
                tabindex="-1"
                translate="no"
              >
                <div
                  class="cm-activeLine cm-line"
                >
                  <span
                    class="token keyword"
                  >
                    export
                  </span>
                   
                  <span
                    class="token keyword"
                  >
                    default
                  </span>
                   
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
                </div>
                <div
                  class="cm-line"
                >
                    
                  <span
                    class="token keyword"
                  >
                    return
                  </span>
                   
                  <span
                    class="token angle-bracket"
                  >
                    &lt;
                  </span>
                  <span
                    class="token class-name"
                  >
                    div
                  </span>
                  <span
                    class="token angle-bracket"
                  >
                    &gt;
                  </span>
                  Hello World
                  <span
                    class="token angle-bracket"
                  >
                    &lt;/
                  </span>
                  <span
                    class="token class-name"
                  >
                    div
                  </span>
                  <span
                    class="token angle-bracket"
                  >
                    &gt;
                  </span>
                  <span
                    class="token punctuation"
                  >
                    ;
                  </span>
                </div>
                <div
                  class="cm-line"
                >
                  <span
                    class="token punctuation"
                  >
                    }
                  </span>
                </div>
                <div
                  class="cm-line"
                >
                  <br />
                </div>
              </div>
              <div
                aria-hidden="true"
                class="cm-selectionLayer"
              />
              <div
                aria-hidden="true"
                class="cm-cursorLayer"
                style="animation-duration: 1200ms;"
              />
            </div>
          </div>
        </div>
        <div
          class="css-0 preview"
        >
          <div>
            Hello World
          </div>
        </div>
        <div
          role="status"
        />
      </div>
    </div>
  `);
});
