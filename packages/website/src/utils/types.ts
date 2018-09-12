export interface Section {
  name: string;
  slug: string;
  filepath?: string;
  props: { [key: string]: any };
  sections?: Section[];
  components?: Section[];
  hasExamples: boolean;
  content: string;
}
