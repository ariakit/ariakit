// @ts-ignore
import index from "./.pages/index.json";

type Index = Record<
  string,
  Array<{
    group: string | null;
    slug: string;
    title: string;
    description: string;
  }>
>;

export default index as Index;
