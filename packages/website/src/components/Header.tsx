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
  Portal,
} from "reakit";
import { FaGithub } from "react-icons/fa";
import { MdMenu } from "react-icons/md";
import { usePalette, useFade } from "reakit-system-palette/utils";
import { LinkGetProps } from "@reach/router";
import Logo from "../icons/Logo";
import useViewportWidthGreaterThan from "../hooks/useViewportWidthGreaterThan";
import useLocation from "../hooks/useLocation";
import track from "../utils/track";
import Anchor from "./Anchor";
import SkipToContent from "./SkipToContent";
import Spacer from "./Spacer";
import HiddenMediaQuery from "./HiddenMediaQuery";
import DocsNavigation from "./DocsNavigation";
import SearchBar from "./SearchBar";

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
  const dialog = useDialogState({ animated: true });
  const location = useLocation();
  const headerZIndex = 910;
  const narrowBreakpoint = 450;

  React.useEffect(dialog.hide, [location.pathname]);

  return (
    <>
      <div
        className={css`
          background-color: black;
          color: white;
          position: fixed;
          top: 0;
          width: 100%;
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
          padding: 17px 15px;
          z-index: ${headerZIndex};
          @media (min-width: 768px) {
            padding: 15px 56px;
          }
        `}
      >
        Looking for Reakit&apos;s successor?
        <a
          href="https://ariakit.org"
          className={css`
            text-decoration: none;
            color: #61dafb;
            &:hover {
              text-decoration: underline;
            }
            @media (max-width: ${narrowBreakpoint}px) {
              display: block;
            }
          `}
        >
          Visit Ariakit
        </a>
      </div>
      <header
        className={css`
          position: fixed;
          top: 48px;
          left: 0;
          width: 100%;
          z-index: 910;
          height: calc(var(--header-height));
          box-sizing: border-box;
          background: ${background};
          display: flex;
          align-items: center;
          padding: 0 56px;
          will-change: background;
          ${!transparent && `box-shadow: 0 1px 2px ${boxShadowColor}`};
          ${transparent &&
          css`
            background: transparent;
            color: white;
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
            height: var(--header-height);
            & > *:not(:last-child) {
              margin-right: 8px;
            }
            a {
              font-size: 1em !important;
            }
          }

          @media (max-width: ${narrowBreakpoint}px) {
            top: 66px;
          }
        `}
      >
        <Global
          styles={{
            ":root": {
              "--header-height": "60px",
            },
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
            <DialogBackdrop {...dialog} animated={false} />
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
              transform: translateX(-100%);
              &[data-enter] {
                transform: translateX(0);
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
          {(props) => (
            <>
              {isLarge && (
                <SearchBar
                  {...props}
                  variant={transparent ? "negative" : "default"}
                />
              )}
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
            </>
          )}
        </HiddenMediaQuery>
        <Anchor
          href="https://github.com/reakit/reakit"
          onClick={track("reakit.headerGithubClick")}
        >
          <FaGithub style={{ fontSize: "1.2em" }} />
          <HiddenMediaQuery query="max-width: 900px">
            <Spacer width={8} />
            GitHub
          </HiddenMediaQuery>
          {!isLarge && <VisuallyHidden>GitHub</VisuallyHidden>}
        </Anchor>
      </header>
    </>
  );
}
