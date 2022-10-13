import { useId } from "ariakit-react-utils/hooks";
import { cx } from "ariakit-utils/misc";
import Link from "next/link";
import tw from "packages/website/utils/tw";
import NewWindow from "../icons/new-window";
import Logo from "../logo";

const style = {
  link: tw`
    inline-flex items-center gap-2
    rounded-sm
    hover:underline
    text-black/80 dark:text-white/70
    hover:text-black dark:hover:text-white
    focus-visible:ariakit-outline
  `,
};

const year = new Date().getFullYear();

const links = [
  {
    title: "Documentation",
    links: [
      { title: "Guide", href: "/guide" },
      { title: "Components", href: "/components" },
      { title: "Examples", href: "/examples" },
    ],
  },
  {
    title: "Updates",
    links: [
      { title: "Blog", href: "/blog" },
      { title: "Newsletter", href: "https://newsletter.ariakit.org" },
      {
        title: "Changelog",
        href: "https://github.com/ariakit/ariakit/blob/main/packages/ariakit/CHANGELOG.md",
      },
    ],
  },
  {
    title: "Community",
    links: [
      { title: "Twitter", href: "https://twitter.com/ariakitjs" },
      { title: "GitHub", href: "https://github.com/ariakit/ariakit" },
      {
        title: "Discussions",
        href: "https://github.com/ariakit/ariakit/discussions",
      },
      { title: "Issues", href: "https://github.com/ariakit/ariakit/issues" },
    ],
  },
];

export default function Footer() {
  const id = useId();
  return (
    <footer className="mt-32 flex w-full justify-center bg-gray-150 text-black/80 dark:bg-gray-850 dark:text-white/80 sm:text-sm">
      <div className="grid w-full max-w-6xl gap-8 p-4 py-8 sm:grid-cols-4 sm:gap-y-16 sm:py-16">
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
        </div>
        {links.map((group, i) => (
          <nav
            key={group.title}
            aria-labelledby={`${id}-${i}`}
            className="flex flex-col gap-6 sm:gap-4"
          >
            <h3 id={`${id}-${i}`} className="font-semibold">
              {group.title}
            </h3>
            <ul className="flex flex-col gap-4 sm:gap-2">
              {group.links.map((link) => (
                <li key={link.title}>
                  {link.href.startsWith("http") ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={style.link}
                    >
                      {link.title}
                      <NewWindow className="h-4 w-4 opacity-60" />
                    </a>
                  ) : (
                    <Link href={link.href}>
                      <a className={style.link}>{link.title}</a>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="flex justify-center whitespace-nowrap text-sm sm:block">
          <a
            href="https://www.vercel.com/?utm_source=ariakit&utm_campaign=oss"
            target="_blank"
            rel="noreferrer"
            className={cx(style.link, "gap-1 hover:no-underline")}
          >
            Powered by
            <svg viewBox="0 0 4438 1000" className="h-4 fill-current">
              <path d="M2223.75 250C2051.25 250 1926.87 362.5 1926.87 531.25C1926.87 700 2066.72 812.5 2239.38 812.5C2343.59 812.5 2435.47 771.25 2492.34 701.719L2372.81 632.656C2341.25 667.188 2293.28 687.344 2239.38 687.344C2164.53 687.344 2100.94 648.281 2077.34 585.781H2515.16C2518.59 568.281 2520.63 550.156 2520.63 531.094C2520.63 362.5 2396.41 250 2223.75 250ZM2076.09 476.562C2095.62 414.219 2149.06 375 2223.75 375C2298.59 375 2352.03 414.219 2371.41 476.562H2076.09ZM2040.78 78.125L1607.81 828.125L1174.69 78.125H1337.03L1607.66 546.875L1878.28 78.125H2040.78ZM577.344 0L1154.69 1000H0L577.344 0ZM3148.75 531.25C3148.75 625 3210 687.5 3305 687.5C3369.38 687.5 3417.66 658.281 3442.5 610.625L3562.5 679.844C3512.81 762.656 3419.69 812.5 3305 812.5C3132.34 812.5 3008.13 700 3008.13 531.25C3008.13 362.5 3132.5 250 3305 250C3419.69 250 3512.66 299.844 3562.5 382.656L3442.5 451.875C3417.66 404.219 3369.38 375 3305 375C3210.16 375 3148.75 437.5 3148.75 531.25ZM4437.5 78.125V796.875H4296.88V78.125H4437.5ZM3906.25 250C3733.75 250 3609.38 362.5 3609.38 531.25C3609.38 700 3749.38 812.5 3921.88 812.5C4026.09 812.5 4117.97 771.25 4174.84 701.719L4055.31 632.656C4023.75 667.188 3975.78 687.344 3921.88 687.344C3847.03 687.344 3783.44 648.281 3759.84 585.781H4197.66C4201.09 568.281 4203.12 550.156 4203.12 531.094C4203.12 362.5 4078.91 250 3906.25 250ZM3758.59 476.562C3778.13 414.219 3831.41 375 3906.25 375C3981.09 375 4034.53 414.219 4053.91 476.562H3758.59ZM2961.25 265.625V417.031C2945.63 412.5 2929.06 409.375 2911.25 409.375C2820.47 409.375 2755 471.875 2755 565.625V796.875H2614.38V265.625H2755V409.375C2755 330 2847.34 265.625 2961.25 265.625Z" />
            </svg>
          </a>
        </div>
        <div className="text-center text-sm dark:text-white/60 sm:col-span-3 sm:text-left">
          <p>
            © 2017-{year} Diego Haz. This site is licensed under{" "}
            <a
              href="http://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="license noreferrer"
              className={cx(style.link, "font-semibold dark:text-white/70")}
            >
              CC BY 4.0
            </a>
            . Library and examples are licensed under{" "}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="license noreferrer"
              className={cx(style.link, "font-semibold dark:text-white/70")}
            >
              MIT
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
