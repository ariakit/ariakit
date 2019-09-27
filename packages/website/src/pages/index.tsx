// TODO: Refactor this mess
import * as React from "react";
import { Link } from "gatsby";
import { css } from "emotion";
import { Button } from "reakit";
import { FiGithub } from "react-icons/fi";
import { MdStar } from "react-icons/md";
import { usePalette } from "reakit-system-palette/utils";
import SEO from "../components/SEO";
import image from "../images/components.svg";
import Spacer from "../components/Spacer";
import pattern from "../images/pattern.svg";
import Paragraph from "../components/Paragraph";
import Heading from "../components/Heading";
import Accessible from "../icons/Accessible";
import Composable from "../icons/Composable";
import Customizable from "../icons/Customizable";
import TinyFast from "../icons/TinyFast";
import HomePlayground from "../components/HomePlayground";
import track from "../utils/track";
import NewsletterForm from "../components/NewsletterForm";

function useGitHubStars() {
  const [stars, setStars] = React.useState<number | null>(null);
  React.useEffect(() => {
    fetch("https://api.github.com/repos/reakit/reakit")
      .then(result => result.json())
      .then(response => setStars(response.stargazers_count));
  }, []);
  return stars;
}

export default function IndexPage() {
  const stars = useGitHubStars();
  const link = usePalette("link");
  return (
    <>
      <SEO title="Reakit – Toolkit for building accessible UIs" />
      <div
        className={css`
          width: 100%;
          min-height: 500px;
          max-height: 700px;
          height: calc(100vh - 80px);
          background: linear-gradient(
            144deg,
            #7b60ff,
            #c050ee 15%,
            #c050ee 30%,
            #5640dd
          );
          @media (max-width: 768px) {
            height: auto;
            background: linear-gradient(
              144deg,
              #5640dd,
              #c050ee 60%,
              #c050ee 75%,
              #7b60ff
            );
          }
        `}
      >
        <div
          className={css`
            height: 100%;
            background-image: url(${pattern});
            background-size: 6%;
          `}
        >
          <div
            className={css`
              display: flex;
              flex-direction: column;
              justify-content: center;
              position: relative;
              margin: 0 auto;
              padding: 16px 56px;
              max-width: 1200px;
              height: calc(100% + 68px);
              box-sizing: border-box;
              background: url(${image}) right 32px bottom no-repeat;
              background-size: 57%;
              z-index: 1;
              @media (max-width: 768px) {
                padding: 8px;
                background-position: center top var(--header-height, 60px);
                background-size: 65%;
                height: auto;
              }
            `}
          >
            <h1
              className={css`
                font-size: 3.2em;
                font-weight: 700;
                line-height: 1.1;
                color: white;
                width: 10em;
                margin: 0 0 40px 0;
                @media (max-width: 768px) {
                  font-size: 1.8em;
                  width: auto;
                  text-align: center;
                  margin: calc(var(--header-height, 60px) + 47%) 0 40px 0;
                }
              `}
            >
              Build accessible rich web apps with React
            </h1>
            <div
              className={css`
                display: grid;
                grid-gap: 20px;
                grid-auto-flow: column;
                justify-content: start;
                a {
                  font-weight: 500;
                  text-transform: uppercase;
                  padding-left: 1em;
                  padding-right: 1em;
                }
                @media (max-width: 768px) {
                  justify-content: center;
                  grid-auto-flow: row;
                  grid-gap: 8px;
                }
              `}
            >
              <Button
                as={Link}
                to="/docs/get-started/"
                unstable_system={{ palette: "white" }}
                onClick={track("reakit.heroGuideClick")}
              >
                Get started
              </Button>
              <Button
                as={Link}
                to="/docs/button/"
                unstable_system={{ palette: "secondary" }}
                onClick={track("reakit.heroComponentsClick")}
              >
                Components
              </Button>
            </div>
            <div
              className={css`
                margin: 30px 0;
                display: grid;
                grid-auto-flow: column;
                justify-content: start;
                grid-gap: 20px;
                @media (max-width: 768px) {
                  justify-content: center;
                }
                a {
                  display: inline-flex;
                  align-items: center;
                  text-transform: uppercase;
                  color: white;
                  text-decoration: none;
                  font-size: 0.875em;
                  &:hover {
                    text-decoration: underline;
                  }
                  svg {
                    font-size: 1.2em;
                  }
                }
              `}
            >
              <a
                href="https://github.com/reakit/reakit"
                onClick={track("reakit.heroGithubClick")}
              >
                <FiGithub />
                <Spacer width={8} />
                View Reakit on GitHub
              </a>
              {stars && (
                <a
                  href="https://github.com/reakit/reakit/stargazers"
                  onClick={track("reakit.heroStarsClick")}
                >
                  <MdStar />
                  <Spacer width={8} />
                  {stars}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={css`
          padding: 140px 0 160px;
          background: linear-gradient(
            144deg,
            #f9f9f9 calc(100% - 480px),
            #fff calc(100% - 480px)
          );
          @media (max-width: 768px) {
            padding: 32px 0 72px;
          }
        `}
      >
        <div
          className={css`
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            grid-gap: 32px;
            max-width: 1200px;
            padding: 0 56px;
            box-sizing: border-box;
            margin: 0 auto;
            @media (max-width: 1024px) {
              grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            }
            @media (max-width: 768px) {
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
              padding: 0 24px;
              grid-gap: 24px;
            }
            &&& {
              a {
                text-decoration: none;
                color: #444;

                h2 {
                  font-size: 1.5em;
                  display: grid;
                  grid-gap: 8px;
                  grid-auto-flow: column;
                  align-items: center;
                  justify-content: start;
                }

                span {
                  font-weight: 500;
                  color: ${link};
                  white-space: nowrap;
                }
                &:hover span,
                &:hover h2 {
                  text-decoration: underline;
                }
              }
            }
          `}
        >
          <Link to="/docs/accessibility/">
            <Heading as="h2">
              <Accessible />
              Accessible
            </Heading>
            <Paragraph>
              Reakit strictly follows <strong>WAI-ARIA 1.1</strong> standards.
              All components come with proper attributes and keyboard
              interactions out of the box. <span>Learn more</span>
            </Paragraph>
          </Link>
          <Link to="/docs/composition/">
            <Heading as="h2">
              <Composable />
              Composable
            </Heading>
            <Paragraph>
              Reakit is built with composition in mind. You can leverage any
              component or hook to create new things. <span>Learn more</span>
            </Paragraph>
          </Link>
          <Link to="/docs/styling/">
            <Heading as="h2">
              <Customizable />
              Customizable
            </Heading>
            <Paragraph>
              Reakit components are unstyled by default in the core library.
              Each component returns a single HTML element that accepts all HTML
              props, including <code>className</code> and <code>style</code>.{" "}
              <span>Learn more</span>
            </Paragraph>
          </Link>
          <Link to="/docs/bundle-size/">
            <Heading as="h2">
              <TinyFast />
              Tiny & Fast
            </Heading>
            <Paragraph>
              Reakit components are built with modern React and follow best
              practices. Each imported component will add from a few bytes to up
              to <code>3 kB</code> into your bundle. <span>Learn more</span>
            </Paragraph>
          </Link>
        </div>
      </div>
      <HomePlayground />
      <div
        className={css`
          max-width: 800px;
          margin: 120px auto 0;
          padding: 40px 16px;
          box-sizing: border-box;
          /* text-align: center; */
          @media (max-width: 768px) {
            margin-top: 32px;
          }
          form {
            text-align: left;
            display: grid;
            grid-auto-flow: column;
            align-items: start;
            grid-gap: 16px;
            > *:not(button) {
              margin: 0 !important;
            }
            button {
              margin-top: 1.5em !important;
            }
            @media (max-width: 768px) {
              grid-auto-flow: row;
              grid-gap: 16px;
              button {
                margin-top: 0 !important;
              }
            }
          }
        `}
      >
        <NewsletterForm />
      </div>
    </>
  );
}
