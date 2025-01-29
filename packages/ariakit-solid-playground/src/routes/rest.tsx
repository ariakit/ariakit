import { createEffect, createSignal } from "solid-js";

import { Role } from "@ariakit/solid";
import { As } from "@ariakit/solid";
import { VisuallyHidden } from "@ariakit/solid";
import { HeadingLevel } from "@ariakit/solid";
import { Heading } from "@ariakit/solid";
// import { Group } from "@ariakit/solid";
// import { GroupLabel } from "@ariakit/solid";
import { Separator } from "@ariakit/solid";
import { FocusTrapRegion } from "@ariakit/solid";
import {
  FocusTrap,
  useFocusTrap,
} from "@ariakit/solid-core/focus-trap/focus-trap";

export default function Rest() {
  let focusTargetRef!: HTMLButtonElement;
  let focusTarget2Ref!: HTMLButtonElement;
  const [focusTrapRegionEnabled, setFocusTrapRegionEnabled] =
    createSignal(false);
  let headingRef!: HTMLDivElement;
  createEffect(() => {
    console.log({ headingRef });
  });
  let portalTargetRef!: HTMLDivElement;
  return (
    <div>
      <h2>Visually hidden (inspect)</h2>
      Here: <VisuallyHidden>Hello I'm hidden</VisuallyHidden>
      <h2>Focus trap (tab into it)</h2>
      <FocusTrap onFocus={() => focusTargetRef.focus()}>hidden</FocusTrap>
      <button>decoy button</button>
      <button ref={focusTargetRef!}>focus target!</button>
      <h2>Focus trap but using hook</h2>
      <Role.span
        {...useFocusTrap({ onFocus: () => focusTarget2Ref.focus() })}
      />
      <button>decoy button</button>
      <button ref={focusTarget2Ref!}>focus target!</button>
      <h2>Focus trap region</h2>
      <button onClick={() => setFocusTrapRegionEnabled((v) => !v)}>
        {focusTrapRegionEnabled()
          ? "Currently enabled, click to disable"
          : "Currently disabled, click to enable"}
      </button>
      <FocusTrapRegion enabled={focusTrapRegionEnabled()}>
        <button>click me</button>
        <button>trap focus</button>
        <button disabled>disabled button</button>
      </FocusTrapRegion>
      <h2>Portal (target)</h2>
      <div>Target below:</div>
      <div data-portal-target ref={portalTargetRef} />
      <h2>Headings</h2>
      <HeadingLevel>
        <Heading ref={headingRef as HTMLHeadingElement} render={<As.div />}>
          H1?
        </Heading>
        <HeadingLevel>
          <Heading
            class="a"
            data-test="outer"
            onClick={() => console.log("outer")}
            render={
              <As.div
                class="b"
                data-test="inner"
                onClick={() => console.log("inner")}
              />
            }
          >
            H2?
          </Heading>
          <HeadingLevel>
            <Heading>H3?</Heading>
          </HeadingLevel>
          <HeadingLevel>
            <Heading render="p">H3 (p)</Heading>
          </HeadingLevel>
        </HeadingLevel>
      </HeadingLevel>
      <h2>Group</h2>
      {/* TODO: this is currently broken */}
      {/* <Group>
        <GroupLabel>Label</GroupLabel>
      </Group>
      <Group>
        <GroupLabel id="my-id">Label with id</GroupLabel>
      </Group> */}
      <h2>Separator</h2>
      <Separator />
      <Separator orientation="vertical" />
      {/* <h2>Portal (declaration)</h2>
      <Portal
        id="test-id"
        portalElement={portalTargetRef}
        data-portal-component
        portalRef={(el) => el && (el.dataset.name = 'portal-ref')}
        ref={(el) => el && (el.dataset.name = 'ref')}>
        <div data-inside-portal>hello! i am portalled!!!</div>
      </Portal>
      <Portal
        portalElement={portalTargetRef}
        data-portal-component
        portalRef={(el) => el && (el.dataset.name = 'portal-ref')}
        ref={(el) => el && (el.dataset.name = 'ref')}>
        hello! i am portalled too!!!
      </Portal>
      <Portal
        data-portal-component
        portalRef={(el) => el && (el.dataset.name = 'portal-ref')}
        ref={(el) => el && (el.dataset.name = 'ref')}>
        hello! i am portalled to body!!!
      </Portal>
      <Portal
        data-portal-component
        portalRef={(el) => el && (el.dataset.name = 'portal-ref')}
        ref={(el) => el && (el.dataset.name = 'ref')}>
        hello! i am portalled to body too!!!
      </Portal>
      <h2>Portal (disabled)</h2>
      <Portal
        portal={false}
        portalElement={portalTargetRef}
        data-portal-component
        portalRef={(el) => el && (el.dataset.name = 'portal-ref')}
        ref={(el) => el && (el.dataset.name = 'ref')}>
        hello! i am NOT portalled!!!
      </Portal>
      <Portal
        id="my-id"
        portalRef={(el) => el && (el.dataset.name = 'portal-ref')}
        ref={(el) => el && (el.dataset.name = 'ref')}>
        hello! i have a specific id!!!
      </Portal>
      <button>1</button>
      <Portal
        preserveTabOrder
        portalRef={(el) => el && (el.dataset.name = 'portal-ref')}
        ref={(el) => el && (el.dataset.name = 'ref')}>
        i respect tab order
        <button>2</button>
        <button>3</button>
      </Portal>
      <button>4</button> */}
    </div>
  );
}
