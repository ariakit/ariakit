import React from "react";
import { styled, Heading, Flex, Base } from "reakit";
import CodeIcon from "react-icons/lib/md/code";
import EditIcon from "react-icons/lib/md/edit";
import track from "../utils/track";
import getSectionGitHubUrl from "../utils/getSectionGitHubUrl";
import ButtonTransparent from "../elements/ButtonTransparent";
import SectionContentWrapper from "../elements/SectionContentWrapper";

const Name = styled(Heading)`
  margin-right: auto;
`;

const GithubSrcButtonText = styled(Base)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const SectionGitHubButtons = ({ section, ...props }) => {
  const githubDocUrl = getSectionGitHubUrl(section, "md");
  const githubSrcUrl = getSectionGitHubUrl(section, "js");
  return (
    <SectionContentWrapper alignItems="center" {...props}>
      <Name>{section.name}</Name>
      <Flex>
        {githubSrcUrl && (
          <ButtonTransparent
            as="a"
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
            as="a"
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

export default SectionGitHubButtons;
