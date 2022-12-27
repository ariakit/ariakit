import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const [react, vue] = await Promise.all([
    fetch("https://registry.npmjs.org/@ariakit/react"),
    fetch("https://registry.npmjs.org/@ariakit/vue"),
  ]);
  const reactData = await react.json();
  const vueData = await vue.json();

  const versions = {
    "@ariakit/react": reactData["dist-tags"],
    "@ariakit/vue": vueData["dist-tags"],
  };

  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "cache-control",
      "public, s-maxage=1200, stale-while-revalidate=600"
    );
  }

  res.status(200).json(versions);
}
