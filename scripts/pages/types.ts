export type Page = {
  /**
   * The name of the page that will be used in the url. This should be a unique
   * name within the app.
   */
  name: string;
  /**
   * Where the source files for the page are located.
   */
  sourceContext: string;
  /**
   * The pattern that will be used to match the source files for the page within
   * `sourceContext`.
   */
  sourceRegExp: RegExp;
  /**
   * The path to the React component file that will be used to render the page.
   */
  pageComponentPath: string;
  /**
   * The path to the React component file that will be used to render the
   * playgrounds.
   */
  playgroundComponentPath: string;
  /**
   * The directory where the build files should be placed.
   * @default `${process.cwd()}/.pages`
   */
  buildDir?: string;
  /**
   * The directory where the symlink files should be placed.
   * @default `${process.cwd()}/pages`
   */
  pagesDir?: string;
  /**
   * A function that returns the group name for the page or null if the page
   * should not be grouped.
   */
  getGroup?: (filename: string) => string | null;
};

export type Pages = Page[];

export type PageIndexDetail = {
  /**
   * The name of the group that the page belongs to. This string is returned by
   * the getGroup function.
   */
  group: string | null;
  /**
   * The slug of the page to be used in the URL.
   */
  slug: string;
  /**
   * The title of the page.
   */
  title: string;
  /**
   * The content of the page or section.
   */
  content: string;
};

export type PageIndex = Record<string, PageIndexDetail[]>;

export type PageContent = PageIndexDetail & {
  /**
   * The category that the page belongs to (e.g., "components", "examples").
   */
  category: string;
  /**
   * If the content is a section of another page, this is the id of the section
   * heading that can be used to link to the section.
   */
  id: string | null;
  /**
   * The parent section title if any.
   */
  parentSection: string | null;
  /**
   * The section title if any.
   */
  section: string | null;
};

export type PageContents = PageContent[];
