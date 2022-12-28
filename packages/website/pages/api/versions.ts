import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const [ariakit, reakit] = await Promise.all([
    fetch("https://registry.npmjs.org/ariakit"),
    fetch("https://registry.npmjs.org/reakit"),
  ]);
  const ariakitData = await ariakit.json();
  const reakitData = await reakit.json();

  const versions = {
    ...ariakitData["dist-tags"],
    v1: reakitData["dist-tags"].latest,
  };

  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "cache-control",
      "public, s-maxage=1200, stale-while-revalidate=600"
    );
  }

  res.status(200).json(versions);
}
