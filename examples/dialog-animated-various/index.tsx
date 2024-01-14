import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  const [transition, setTransition] = useState(false);
  const [transitionUnmount, setTransitionUnmount] = useState(false);
  const [transitionBackdrop, setTransitionBackdrop] = useState(false);
  const [transitionNoModal, setTransitionNoModal] = useState(false);
  const [transitionNoLeave, setTransitionNoLeave] = useState(false);
  const [animation, setAnimation] = useState(false);
  const [animationUnmount, setAnimationUnmount] = useState(false);
  const [animationBackdrop, setAnimationBackdrop] = useState(false);
  const [animationNoModal, setAnimationNoModal] = useState(false);
  const [animationLeave, setAnimationLeave] = useState(false);
  return (
    <div className="wrapper">
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

      <Ariakit.DialogProvider
        open={transitionUnmount}
        setOpen={setTransitionUnmount}
      >
        <Ariakit.Button
          onClick={() => setTransitionUnmount(true)}
          className="button"
        >
          TransitionUnmount
        </Ariakit.Button>
        <Ariakit.Dialog unmountOnHide className="dialog dialog-transition">
          <Ariakit.DialogHeading className="heading">
            TransitionUnmount
          </Ariakit.DialogHeading>
          <Ariakit.DialogDismiss className="button">
            Close
          </Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>

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
        className="dialog dialog-transition"
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

      <Ariakit.Button
        onClick={() => setAnimationBackdrop(true)}
        className="button"
      >
        AnimationBackdrop
      </Ariakit.Button>
      <Ariakit.Dialog
        open={animationBackdrop}
        backdrop={<div className="backdrop backdrop-animation" />}
        onClose={() => setAnimationBackdrop(false)}
        className="dialog dialog-animation"
      >
        <Ariakit.DialogHeading className="heading">
          AnimationBackdrop
        </Ariakit.DialogHeading>
        <Ariakit.DialogDismiss className="button">Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>

      <Ariakit.Button
        onClick={() => setAnimationUnmount(true)}
        className="button"
      >
        AnimationUnmount
      </Ariakit.Button>
      <Ariakit.Dialog
        open={animationUnmount}
        unmountOnHide
        onClose={() => setAnimationUnmount(false)}
        className="dialog dialog-animation"
      >
        <Ariakit.DialogHeading className="heading">
          AnimationUnmount
        </Ariakit.DialogHeading>
        <Ariakit.DialogDismiss className="button">Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>

      <Ariakit.Button
        onClick={() => setAnimationNoModal(true)}
        className="button"
      >
        AnimationNoModal
      </Ariakit.Button>
      <Ariakit.Dialog
        open={animationNoModal}
        modal={false}
        onClose={() => setAnimationNoModal(false)}
        className="dialog dialog-animation"
      >
        <Ariakit.DialogHeading className="heading">
          AnimationNoModal
        </Ariakit.DialogHeading>
        <Ariakit.DialogDismiss className="button">Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>

      <Ariakit.Button
        onClick={() => setAnimationLeave(true)}
        className="button"
      >
        AnimationLeave
      </Ariakit.Button>
      <Ariakit.Dialog
        open={animationLeave}
        onClose={() => setAnimationLeave(false)}
        className="dialog dialog-animation-leave"
      >
        <Ariakit.DialogHeading className="heading">
          AnimationLeave
        </Ariakit.DialogHeading>
        <Ariakit.DialogDismiss className="button">Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </div>
  );
}
