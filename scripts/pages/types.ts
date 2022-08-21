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
  componentPath: string;
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
