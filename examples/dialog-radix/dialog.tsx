import * as React from "react";
import * as Ariakit from "@ariakit/react";

/* CONTEXT */

interface DialogContextValue {
  store: Ariakit.DialogStore;
  modal: boolean;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);
const ForceMountContext = React.createContext(false);

/* SLOT */

interface SlotProps extends React.ComponentPropsWithoutRef<"div"> {
  children?: React.ReactElement;
}

export const Slot = React.forwardRef<HTMLDivElement, SlotProps>(
  ({ children, ...props }, ref) => {
    return <Ariakit.Role ref={ref} {...props} render={children} />;
  }
);

/* ROOT */

interface RootProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children?: React.ReactNode;
}

export function Root(props: RootProps) {
  const store = Ariakit.useDialogStore({
    open: props.open,
    defaultOpen: props.defaultOpen,
    setOpen: props.onOpenChange,
  });
  const modal = props.modal ?? true;
  const contextValue = { store, modal };
  return (
    <DialogContext.Provider value={contextValue}>
      {props.children}
    </DialogContext.Provider>
  );
}

/* TRIGGER */

interface TriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger({ asChild, ...props }, ref) {
    const { store } = React.useContext(DialogContext)!;
    const open = store.useState("open");
    return (
      <Ariakit.DialogDisclosure
        {...props}
        ref={ref}
        store={store}
        data-state={open ? "open" : "closed"}
        render={asChild ? <Slot /> : undefined}
      />
    );
  }
);

/* PORTAL */

interface PortalProps {
  forceMount?: boolean;
  container?: HTMLElement | null;
  children?: React.ReactNode;
}

export function Portal({
  forceMount = false,
  container,
  children,
}: PortalProps) {
  const { store } = React.useContext(DialogContext)!;
  const portalContext = React.useContext(Ariakit.PortalContext);
  const mounted = store.useState((state) => forceMount || state.mounted);
  if (!mounted) return null;
  return (
    <Ariakit.PortalContext.Provider value={container ?? portalContext}>
      <ForceMountContext.Provider value={forceMount}>
        <Ariakit.Portal>{children}</Ariakit.Portal>
      </ForceMountContext.Provider>
    </Ariakit.PortalContext.Provider>
  );
}

/* OVERLAY */

interface OverlayProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  forceMount?: boolean;
}

export const Overlay = React.forwardRef<HTMLDivElement, OverlayProps>(
  function Overlay({ asChild, forceMount, ...props }, ref) {
    const { store } = React.useContext(DialogContext)!;
    const forceMountContext = React.useContext(ForceMountContext);
    forceMount = forceMount ?? forceMountContext;
    const mounted = store.useState((state) => forceMount || state.mounted);

    const open = store.useState("open");
    const [state, setState] = React.useState("closed");

    // Sets the state on the next animation frame so that the transition can be
    // triggered.
    React.useEffect(() => {
      const raf = requestAnimationFrame(() => {
        setState(open ? "open" : "closed");
      });
      return () => cancelAnimationFrame(raf);
    }, [open]);

    const disclosure = Ariakit.useDisclosureStore({
      open,
      setOpen: store.setOpen,
    });

    if (!mounted) return null;

    return (
      <Ariakit.DisclosureContent
        {...props}
        ref={ref}
        store={disclosure}
        data-state={state}
        render={asChild ? <Slot /> : undefined}
      />
    );
  }
);

/* CONTENT */

interface ContentProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  forceMount?: boolean;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: Event) => void;
  onInteractOutside?: (event: Event) => void;
}

export const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  function Content(
    {
      asChild,
      forceMount,
      onOpenAutoFocus,
      onCloseAutoFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      onInteractOutside,
      ...props
    },
    ref
  ) {
    const { store, modal } = React.useContext(DialogContext)!;
    const forceMountContext = React.useContext(ForceMountContext);
    forceMount = forceMount ?? forceMountContext;
    const mounted = store.useState((state) => forceMount || state.mounted);
    const contentElement = store.useState("contentElement");

    const open = store.useState("open");
    const [state, setState] = React.useState("closed");

    // Sets the state on the next animation frame so that the transition can be
    // triggered.
    React.useEffect(() => {
      const raf = requestAnimationFrame(() => {
        setState(open ? "open" : "closed");
      });
      return () => cancelAnimationFrame(raf);
    }, [open]);

    if (!mounted) return null;

    return (
      <Ariakit.Dialog
        {...props}
        ref={ref}
        store={store}
        modal={modal}
        portal={false}
        backdrop={false}
        data-state={state}
        alwaysVisible={forceMount}
        render={asChild ? <Slot /> : <div />}
        autoFocusOnShow={() => {
          const type = "focusScope.autoFocusOnMount";
          const event = new CustomEvent(type, { cancelable: true });
          const cb = onOpenAutoFocus || (() => {});
          contentElement?.addEventListener(type, cb, { once: true });
          contentElement?.dispatchEvent(event);
          return !event.defaultPrevented;
        }}
        autoFocusOnHide={() => {
          const type = "focusScope.autoFocusOnUnmount";
          const event = new CustomEvent(type, { cancelable: true });
          const cb = onCloseAutoFocus || (() => {});
          contentElement?.addEventListener(type, cb, { once: true });
          contentElement?.dispatchEvent(event);
          return !event.defaultPrevented;
        }}
        hideOnEscape={(event) => {
          if (!onEscapeKeyDown) return true;
          onEscapeKeyDown("nativeEvent" in event ? event.nativeEvent : event);
          return !event.defaultPrevented;
        }}
        hideOnInteractOutside={(originalEvent) => {
          // Ariakit doesn't hide dialogs on pointer down (although this can be
          // implemented in userland). So we treat onPointerDownOutside and
          // onInteractOutside the same.
          const type = "dismissableLayer.pointerDownOutside";
          const detail = { originalEvent };
          const event = new CustomEvent(type, { detail, cancelable: true });
          const cb = (evt: Event) => {
            onPointerDownOutside?.(evt);
            onInteractOutside?.(evt);
          };
          contentElement?.addEventListener(type, cb, { once: true });
          contentElement?.dispatchEvent(event);
          return !event.defaultPrevented;
        }}
      />
    );
  }
);

/* CLOSE */

interface CloseProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

export const Close = React.forwardRef<HTMLButtonElement, CloseProps>(
  function Close({ asChild, ...props }, ref) {
    return (
      <Ariakit.DialogDismiss
        ref={ref}
        {...props}
        render={asChild ? <Slot /> : undefined}
      />
    );
  }
);

/* TITLE */

interface TitleProps extends React.ComponentPropsWithoutRef<"h1"> {
  asChild?: boolean;
}

export const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  function Title({ asChild, ...props }, ref) {
    return (
      <Ariakit.DialogHeading
        ref={ref}
        {...props}
        render={asChild ? <Slot /> : undefined}
      />
    );
  }
);

/* DESCRIPTION */

interface DescriptionProps extends React.ComponentPropsWithoutRef<"p"> {
  asChild?: boolean;
}

export const Description = React.forwardRef<
  HTMLParagraphElement,
  DescriptionProps
>(function Description({ asChild, ...props }, ref) {
  return (
    <Ariakit.DialogDescription
      ref={ref}
      {...props}
      render={asChild ? <Slot /> : undefined}
    />
  );
});
