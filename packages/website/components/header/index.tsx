import { cx } from "ariakit-utils/misc";
import {
  Menu,
  MenuBar,
  MenuButton,
  MenuItem,
  useMenuBarState,
  useMenuState,
} from "ariakit/menu";
import {
  Select,
  SelectItem,
  SelectList,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import { VisuallyHidden } from "ariakit/visually-hidden";
import startCase from "lodash/startCase";
import Link from "next/link";
import { useRouter } from "next/router";
import meta from "../../meta";
import button from "../../styles/button";
import Logo from "../logo";
import VersionSelect from "../version-select";

const separator = <div className="opacity-30 font-semibold">/</div>;

export default function Header() {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const [, category, page] = router.asPath.split("/");
  const menubar = useMenuBarState();
  const categorySelect = useSelectState({ defaultValue: category });
  const pageSelect = useSelectState({ defaultValue: page });
  const categoryMenu = useMenuState(categorySelect);
  const pageMenu = useMenuState(pageSelect);

  const breadcrumbs = category ? (
    <>
      {separator}
      <MenuBar state={menubar} className="flex gap-1 items-center">
        <Select state={categorySelect}>
          {(props) => (
            <MenuButton as={MenuItem} {...props} state={categoryMenu}>
              {startCase(categorySelect.value)}
            </MenuButton>
          )}
        </Select>
        {categorySelect.mounted && (
          <SelectPopover portal state={categorySelect}>
            {(props) => (
              <Menu state={categoryMenu} {...props}>
                {Object.keys(meta)?.map((key) => (
                  <SelectItem key={key} value={key}>
                    {startCase(key)}
                  </SelectItem>
                ))}
              </Menu>
            )}
          </SelectPopover>
        )}
        {page && (
          <>
            {separator}
            <Select state={pageSelect}>
              {(props) => (
                <MenuButton as={MenuItem} {...props} state={pageMenu}>
                  {startCase(pageSelect.value)}
                </MenuButton>
              )}
            </Select>
            {pageSelect.mounted && (
              <SelectPopover portal state={pageSelect}>
                {(props) => (
                  <Menu state={pageMenu} {...props}>
                    {meta[category]?.map((item) => (
                      <SelectItem key={item.slug} value={item.slug}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </Menu>
                )}
              </SelectPopover>
            )}
          </>
        )}
      </MenuBar>
      {/* <button
        className={cx(
          button(),
          "rounded-lg h-8 px-2 focus-visible:ariakit-outline-input"
        )}
      >
        {startCase(category)}
      </button>
      {separator}
      <button
        className={cx(
          button(),
          "rounded-lg h-8 px-2 focus-visible:ariakit-outline-input"
        )}
      >
        {meta[category]?.find(({ slug }) => slug === page)?.title}
      </button> */}
    </>
  ) : null;

  const links = (
    <div className="flex gap-8 ml-8">
      <Link href="/guide">
        <a className="hover:underline">Guide</a>
      </Link>
      <Link href="/components">
        <a className="hover:underline">Components</a>
      </Link>
      <Link href="/examples">
        <a className="hover:underline">Examples</a>
      </Link>
    </div>
  );

  return (
    <div
      className={cx(
        "sticky top-0 left-0 w-full z-40",
        "flex pr-[var(--scrollbar-width)] justify-center",
        "bg-canvas-2 dark:bg-canvas-2-dark",
        "backdrop-blur supports-backdrop-blur:bg-canvas-2/80 dark:supports-backdrop-blur:bg-canvas-2-dark/80"
      )}
    >
      <div className="flex items-center gap-4 p-3 sm:p-4 w-full max-w-[1440px]">
        <Link href="/">
          <a
            className={cx(
              "flex items-center gap-2 rounded-[9px]",
              "focus-visible:ariakit-outline"
            )}
          >
            <VisuallyHidden>Ariakit</VisuallyHidden>
            <Logo iconOnly={!isHome} />
          </a>
        </Link>
        <div className="flex gap-1 items-center">
          <VersionSelect />
          {isHome ? links : breadcrumbs}
        </div>
        <button
          className={cx(button(), "ml-auto")}
          onClick={() => {
            if (document.documentElement.classList.contains("dark")) {
              document.documentElement.classList.remove("dark");
              document.documentElement.classList.add("light");
              localStorage.setItem("theme", "light");
            } else {
              document.documentElement.classList.remove("light");
              document.documentElement.classList.add("dark");
              localStorage.setItem("theme", "dark");
            }
          }}
        >
          Toggle dark mode
        </button>
      </div>
    </div>
  );
}
