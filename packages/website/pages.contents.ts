// @ts-ignore
import contents from "./.pages/contents.json";

type Contents = Array<{
  category: string;
  group: string | null;
  slug: string;
  title: string;
  id: string | null;
  parentSection: string | null;
  section: string | null;
  content: string;
}>;

export default contents as Contents;
