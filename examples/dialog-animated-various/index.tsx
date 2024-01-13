import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  const [transition, setTransition] = useState(false);
  const [transitionBackdrop, setTransitionBackdrop] = useState(false);
  const [transitionNoModal, setTransitionNoModal] = useState(false);
  const [transitionNoLeave, setTransitionNoLeave] = useState(false);
  const [animation, setAnimation] = useState(false);
  return (
    <>
      <Ariakit.Button onClick={() => setTransition(true)} className="button">
        Transition
      </Ariakit.Button>
      <Ariakit.Dialog
        open={transition}
        onClose={() => setTransition(false)}
        className="dialog dialog-transition"
      >
        <Ariakit.DialogHeading className="heading">
          Transition
        </Ariakit.DialogHeading>
        <Ariakit.DialogDismiss className="button">Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>

      <Ariakit.Button
        onClick={() => setTransitionBackdrop(true)}
        className="button"
      >
        TransitionBackdrop
      </Ariakit.Button>
      <Ariakit.Dialog
        open={transitionBackdrop}
        backdrop={<div className="backdrop backdrop-transition" />}
        onClose={() => setTransitionBackdrop(false)}
        className="dialog dialog-transition"
      >
        <Ariakit.DialogHeading className="heading">
          TransitionBackdrop
        </Ariakit.DialogHeading>
        <Ariakit.DialogDismiss className="button">Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>

      <Ariakit.Button
        onClick={() => setTransitionNoModal(true)}
        className="button"
      >
        TransitionNoModal
      </Ariakit.Button>
      <Ariakit.Dialog
        open={transitionNoModal}
        modal={false}
        onClose={() => setTransitionNoModal(false)}
        className="dialog dialog-transition-no-modal"
      >
        <Ariakit.DialogHeading className="heading">
          TransitionNoModal
        </Ariakit.DialogHeading>
        <Ariakit.DialogDismiss className="button">Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>

      <Ariakit.Button
        onClick={() => setTransitionNoLeave(true)}
        className="button"
      >
        TransitionNoLeave
      </Ariakit.Button>
      <Ariakit.Dialog
        open={transitionNoLeave}
        onClose={() => setTransitionNoLeave(false)}
        className="dialog dialog-transition-no-leave"
      >
        <Ariakit.DialogHeading className="heading">
          TransitionNoLeave
        </Ariakit.DialogHeading>
        <Ariakit.DialogDismiss className="button">Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>

      <Ariakit.Button onClick={() => setAnimation(true)} className="button">
        Animation
      </Ariakit.Button>
      <Ariakit.Dialog
        open={animation}
        onClose={() => setAnimation(false)}
        className="dialog dialog-animation"
      >
        <Ariakit.DialogHeading className="heading">
          Animation
        </Ariakit.DialogHeading>
        <Ariakit.DialogDismiss className="button">Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </>
  );
}
