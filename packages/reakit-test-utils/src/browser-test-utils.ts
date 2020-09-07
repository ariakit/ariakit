import * as _ from "lodash";
import { Builder, WebDriver } from "selenium-webdriver";

require("dotenv").config();

function getExampleUrl(exampleName: string) {
  // TODO: If CI, use netlify deploy preview
  const STORYBOOK_HOST = "http://localhost:6006/iframe.html";
  const snakeCaseExampleName = _.kebabCase(exampleName);
  const url = new URL(STORYBOOK_HOST);
  url.searchParams.set("id", `example--${snakeCaseExampleName}`);

  return url.toString();
}

// From https://www.browserstack.com/docs/automate/selenium/getting-started/nodejs
// TODO: Make the configurable externally?
const DEVICE_CONFIG = [
  {
    device: "iPhone 11",
    realMobile: "true",
    os_version: "13.0",
  },
  {
    os_version: "Catalina",
    resolution: "1920x1080",
    browser: "Chrome",
    browser_version: "latest",
    os: "OS X",
  },
];

interface Device {
  driver: WebDriver;
  name: string;
}

let cachedDevices: null | Device[] = null;

// TODO: Custom Jest environment to automatically do this once per test run like jest-puppeteer
// This could potentially remove the devices param of runTest.
export async function getDevices() {
  if (!cachedDevices) {
    cachedDevices = await Promise.all(
      DEVICE_CONFIG.map((config) =>
        new Builder()
          .usingServer("https://hub-cloud.browserstack.com/wd/hub")
          .withCapabilities({
            ...config,
            "browserstack.user": process.env.BROWSERSTACK_USERNAME,
            "browserstack.key": process.env.BROWSERSTACK_ACCESS_KEY,
          })
          .build()
          .then((driver) => ({
            driver,
            name: [
              config.os,
              config.device,
              config.os_version,
              config.browser,
              config.browser_version,
              config.resolution,
            ]
              .filter(Boolean)
              .join(" "),
          }))
      )
    );
  }

  return cachedDevices;
}

export interface Context {
  driver: WebDriver;
  getExample: (exampleName: string) => Promise<void>;
}

export function runTest(
  testName: string,
  devices: Device[],
  testFn: (context: Context) => any
) {
  describe(testName, () => {
    for (const { name, driver } of devices) {
      test(name, () =>
        testFn({
          driver,
          getExample(exampleName: string) {
            return driver.get(getExampleUrl(exampleName));
          },
        })
      );
    }
  });
}
