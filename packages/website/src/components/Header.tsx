// TODO: Refactor this mess
import * as React from "react";
import { Link } from "gatsby";
import { css } from "emotion";
import { Global } from "@emotion/core";
import {
  VisuallyHidden,
  DialogDisclosure,
  useDialogState,
  Dialog,
  DialogBackdrop,
  Portal
} from "reakit";
import { FaGithub } from "react-icons/fa";
import { MdMenu } from "react-icons/md";
import { usePalette, useFade } from "reakit-system-palette/utils";
import { LinkGetProps } from "@reach/router";
import Logo from "../icons/Logo";
import SpectrumLogo from "../icons/Spectrum";
import useViewportWidthGreaterThan from "../hooks/useViewportWidthGreaterThan";
import useLocation from "../hooks/useLocation";
import track from "../utils/track";
import Anchor from "./Anchor";
import SkipToContent from "./SkipToContent";
import Spacer from "./Spacer";
import HiddenMediaQuery from "./HiddenMediaQuery";
import DocsNavigation from "./DocsNavigation";

export type HeaderProps = {
  transparent?: boolean;
};

function getLinkProps({ isPartiallyCurrent }: LinkGetProps) {
  if (isPartiallyCurrent) {
    return { "aria-current": "page" };
  }
  return {};
}

export default function Header({ transparent }: HeaderProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isLarge = useViewportWidthGreaterThan(768);
  const background = usePalette("background");
  const foreground = usePalette("foreground");
  const primary = usePalette("primary");
  const boxShadowColor = useFade(foreground, 0.85);
  const dialog = useDialogState({ unstable_animated: true });
  const location = useLocation();

  React.useEffect(dialog.hide, [location.pathname]);

  return (
    <>
      <header
        className={css`
          position: fixed;
          top: -32px;
          left: 0;
          width: 100%;
          z-index: 910;
          height: calc(var(--header-height) + 32px);
          box-sizing: border-box;
          background: ${background};
          display: flex;
          align-items: center;
          padding: 32px 56px 0;
          will-change: background, transform;
          transition: transform 250ms ease-in-out;
          ${!transparent && `box-shadow: 0 1px 2px ${boxShadowColor}`};
          ${transparent &&
            css`
              background: transparent;
              color: white;
              transform: translateY(32px);
            `};

          & > *:not(:last-child) {
            margin-right: 16px;
          }
          a:not([href^="#"]) {
            display: inline-flex;
            align-items: center;
            height: calc(100% - 5px);
            color: inherit;
            font-weight: 400;
            margin-top: 5px;
            border-bottom: 5px solid transparent;
            box-sizing: border-box;
            text-transform: uppercase;
            font-size: 0.875em;
            &:not([href="/"]) {
              padding: 0 1em;
              &:hover {
                color: ${transparent ? "white" : primary};
                text-decoration: ${transparent ? "underline" : "none"};
              }
              &[aria-current="page"] {
                color: ${primary};
                border-color: ${primary};
              }
            }
          }

          @media (max-width: 768px) {
            padding: 0 8px;
            transform: initial;
            top: 0;
            height: var(--header-height);
            & > *:not(:last-child) {
              margin-right: 8px;
            }
            a {
              font-size: 1em !important;
            }
          }
        `}
      >
        <Global
          styles={{
            ":root": {
              "--header-height": "60px"
            }
          }}
        />
        <SkipToContent />
        <HiddenMediaQuery query="min-width: 769px">
          <DialogDisclosure
            {...dialog}
            unstable_system={{ palette: "background" }}
            className={css`
              background: transparent;
              color: inherit;
              font-size: 20px;
              padding: 8px;
              border-radius: 50%;
              border: none;
            `}
          >
            <MdMenu />
            <VisuallyHidden>Open sidebar</VisuallyHidden>
          </DialogDisclosure>
          <Portal>
            <DialogBackdrop {...dialog} unstable_animated={false} />
          </Portal>
          <Dialog
            {...dialog}
            ref={ref}
            aria-label="Sidebar"
            unstable_initialFocusRef={ref}
            className={css`
              top: 0;
              left: 0;
              height: 100vh;
              margin: 0;
              max-height: initial;
              transform: translateX(0);
              transition: transform 250ms ease-in-out;
              border-radius: 0;
              overflow: auto;
              -webkit-overflow-scrolling: touch;
              &.hidden {
                transform: translateX(-100%);
              }
            `}
          >
            <DocsNavigation />
          </Dialog>
        </HiddenMediaQuery>
        <Anchor as={Link} to="/">
          <Logo colored={!transparent} />
          <VisuallyHidden>Reakit</VisuallyHidden>
        </Anchor>
        <div style={{ flex: 1 }} />
        <HiddenMediaQuery query="max-width: 768px">
          {props => (
            <>
              <Anchor
                as={Link}
                to="/docs/"
                getProps={getLinkProps}
                {...props}
                onClick={track("reakit.headerGuideClick")}
              >
                Documentation
              </Anchor>
              <Anchor
                as={Link}
                to="/news/"
                {...props}
                onClick={track("reakit.headerNewsletterClick")}
              >
                Newsletter
              </Anchor>
              <Anchor
                href="https://spectrum.chat/reakit"
                onClick={track("reakit.headerSpectrumClick")}
              >
                <SpectrumLogo />
                <HiddenMediaQuery query="max-width: 768px">
                  <Spacer width={8} />
                  Spectrum
                </HiddenMediaQuery>
              </Anchor>
            </>
          )}
        </HiddenMediaQuery>
        <Anchor
          href="https://github.com/reakit/reakit"
          onClick={track("reakit.headerGithubClick")}
        >
          <FaGithub style={{ fontSize: "1.2em" }} />
          <HiddenMediaQuery query="max-width: 768px">
            <Spacer width={8} />
            GitHub
          </HiddenMediaQuery>
          {!isLarge && <VisuallyHidden>GitHub</VisuallyHidden>}
        </Anchor>
      </header>
    </>
  );
}
