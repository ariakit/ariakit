/** @type {NonNullable<import("next").NextConfig["redirects"]>} */
export async function redirects() {
  return [
    {
      source: "/examples/combobox-matches",
      destination: "/examples/combobox-filtering",
      permanent: true,
    },
  ];
}
