const unified = require("unified");
const remarkParse = require("remark-parse");
const mdastToString = require("mdast-util-to-string");
const { GraphQLString } = require("gatsby/graphql");
const getFirstHeading = require("./getFirstHeading");

const processor = unified().use(remarkParse);

exports.setFieldsOnGraphQLNodeType = ({ type }) => {
  if (type.name === "MarkdownRemark") {
    return {
      title: {
        type: GraphQLString,
        resolve: source => {
          const tree = processor.parse(source.internal.content);
          const heading = getFirstHeading(tree);
          if (!heading) return undefined;
          return mdastToString(heading);
        }
      }
    };
  }
  return {};
};
