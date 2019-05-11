// TODO: Prevent it from appending the ad twice into the DOM
import * as React from "react";
import { css } from "emotion";
import { usePalette, useDarken, useLighten } from "reakit-system-palette/utils";

function loadScript(src: string, container: HTMLElement) {
  const script = document.createElement("script");
  script.setAttribute("async", "");
  script.src = src;
  container.appendChild(script);
  return script;
}

export default function CarbonAd() {
  const ref = React.useRef<HTMLDivElement>(null);
  const background = usePalette("background");
  const foreground = usePalette("foreground");
  const backgroundColor = useDarken(background, 0.025);
  const poweredbyColor = useLighten(foreground, 0.4);

  const carbonAd = css`
    display: block;
    position: relative;
    margin: 32px 0;
    max-width: 480px;
    min-height: 132px;
    background-color: ${backgroundColor};
    color: ${foreground};

    @media (max-width: 480px) {
      font-size: 0.875em;
    }

    a {
      text-decoration: none;
      color: inherit;
      &:hover {
        text-decoration: underline;
      }
    }

    .carbon-wrap {
      display: flex;
      padding: 16px;
    }

    .carbon-img {
      margin-right: 16px;
      img {
        display: block;
      }
    }

    .carbon-text {
      line-height: 1.4;
    }

    .carbon-poweredby {
      position: absolute;
      bottom: 16px;
      left: 162px;
      color: ${poweredbyColor} !important;
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      line-height: 1;
      letter-spacing: 1px;
    }
  `;

  React.useEffect(() => {
    if (!ref.current) return;

    const script = loadScript(
      "https://cdn.carbonads.com/carbon.js?serve=CK7DV27N&placement=reakitio",
      ref.current
    );
    script.id = "_carbonads_js";
  }, []);

  return <span ref={ref} className={carbonAd} />;
}
