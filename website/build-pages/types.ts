export type Page = {
  /**
   * The slug of the category to be used in the URL.
   */
  slug: string;
  /**
   * Where the source files for the page are located.
   */
  sourceContext: string;
  /**
   * A function that returns the group name for the page or null if the page
   * should not be grouped.
   */
  getGroup?: (filename: string) => string | null;
};

export type PageIndexDetail = {
  /**
   * The category that the page belongs to (e.g., "components", "examples").
   */
  category: string;
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

export type PageContent = PageIndexDetail & {
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

export type TableOfContents = Array<{
  /**
   * The id of the section heading that can be used to link to the section.
   */
  id: string;
  /**
   * The title of the section.
   */
  text: string;
  /**
   * The nested sections if any.
   */
  children?: TableOfContents;
}>;

export type Pages = Page[];

export type PageIndex = Record<string, PageIndexDetail[]>;

export type PageContents = PageContent[];
