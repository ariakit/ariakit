import React from "react";
import { styled, Heading, Flex, Base } from "reakit";
import CodeIcon from "react-icons/lib/md/code";
import EditIcon from "react-icons/lib/md/edit";
import track from "../utils/track";
import getSectionGitHubUrl from "../utils/getSectionGitHubUrl";
import ButtonTransparent from "../elements/ButtonTransparent";
import SectionContentWrapper from "../elements/SectionContentWrapper";
import IconOnLeft from "../elements/IconOnLeft";

const Name = styled(Heading)`
  font-size: 40px;
  margin: 0;
  margin-right: auto;
  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const GithubSrcButtonText = styled(Base)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const SectionHeader = ({ section, ...props }) => {
  const githubDocUrl = getSectionGitHubUrl(section, "md");
  const githubSrcUrl = getSectionGitHubUrl(section, "js");
  return (
    <SectionContentWrapper
      alignItems="center"
      paddingTop={12}
      paddingBottom={12}
      {...props}
    >
      <Name>{section.name}</Name>
      <Flex>
        {githubSrcUrl && (
          <ButtonTransparent
            as={[IconOnLeft, "a"]}
            href={githubSrcUrl}
            target="_blank"
            onClick={track("reakit.sectionSourceClick")}
          >
            <CodeIcon />
            <GithubSrcButtonText>View source on GitHub</GithubSrcButtonText>
          </ButtonTransparent>
        )}
        {githubDocUrl && (
          <ButtonTransparent
            as={[IconOnLeft, "a"]}
            href={githubDocUrl}
            target="_blank"
            onClick={track("reakit.sectionMarkdownClick")}
          >
            <EditIcon />
            <GithubSrcButtonText>Improve this page</GithubSrcButtonText>
          </ButtonTransparent>
        )}
      </Flex>
    </SectionContentWrapper>
  );
};

export default SectionHeader;
