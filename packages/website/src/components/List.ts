import { css, cx } from "emotion";
import { useBox, BoxHTMLProps, BoxOptions } from "reakit";
import { createHook, createComponent } from "reakit-system";

export type ListOptions = BoxOptions;
export type ListHTMLProps = BoxHTMLProps;
export type ListProps = ListOptions & ListHTMLProps;

export const useList = createHook<ListOptions, ListHTMLProps>({
  name: "List",
  compose: useBox,

  useProps(_, htmlProps) {
    const list = css`
      line-height: 1.5;
      li {
        margin-bottom: 0.5em;
      }
      #props ~ &,
      #props ~ details > & {
        & > li {
          li {
            margin: 0;
          }
          strong ~ code {
            color: indianred;
          }
          margin-bottom: 1.5em;
          p {
            margin: 0.5em 0 0;
          }
        }
      }
    `;
    return { ...htmlProps, className: cx(list, htmlProps.className) };
  }
});

const List = createComponent({
  as: "ul",
  useHook: useList
});

export default List;
