import Link from "next/link.js";
import { PageContainer } from "@/app/(main)/page-container.tsx";
import { InlineLink } from "@/components/inline-link.tsx";
import {
  PageDivider,
  PageHeading,
  PageList,
  PageListItem,
  PageParagraph,
  PageSection,
} from "@/components/page-elements.tsx";
import { getNextPageMetadata } from "@/lib/get-next-page-metadata.ts";

export function generateMetadata() {
  return getNextPageMetadata({ title: "Ariakit Plus License Agreement" });
}

export default function Page() {
  return (
    <main className="relative mx-auto mt-8 flex w-full min-w-[1px] max-w-7xl flex-col items-center gap-8 px-3 sm:mt-12 sm:px-4 lg:px-8 [&>*]:w-full [&>*]:max-w-3xl">
      <PageContainer title="Ariakit Plus License Agreement">
        <PageParagraph>
          Ariakit Plus grants you a non-exclusive license and permission to use
          the{" "}
          <InlineLink render={<Link href="/tags/plus" />}>
            Ariakit Plus examples
          </InlineLink>{" "}
          (the Materials) available on the Ariakit website.
        </PageParagraph>
        <PageParagraph>
          The license is meant for personal use by one individual (the
          Licensee).
        </PageParagraph>
        <PageSection level={2}>
          <PageHeading level={2}>Permitted use</PageHeading>
          <PageParagraph>
            As a Licensee, you are allowed to use the Materials for any purpose,
            provided it does not compete with Ariakit Plus:
          </PageParagraph>
          <PageList>
            <PageListItem>
              Use the Materials to create unlimited projects.
            </PageListItem>
            <PageListItem>
              Modify the Materials to create derivative works. Such modified
              works are subject to this license.
            </PageListItem>
            <PageListItem>
              Use the Materials to create projects for an unlimited number of
              clients.
            </PageListItem>
            <PageListItem>
              Use the Materials to create projects for sale to end users.
            </PageListItem>
            <PageListItem multiline>
              <PageParagraph>
                Use the Materials to improve your knowledge and then use that
                knowledge to create educational content.
              </PageParagraph>
              <PageParagraph>
                However, ensure your course, book or similar project does not
                include the Materials, whether modified or not.
              </PageParagraph>
            </PageListItem>
          </PageList>
        </PageSection>
        <PageSection level={2}>
          <PageHeading level={2}>Restrictions</PageHeading>
          <PageParagraph>You are expressly prohibited from:</PageParagraph>
          <PageList>
            <PageListItem>
              Sharing your access to the Materials with any other individual.
            </PageListItem>
            <PageListItem>
              Redistributing the Materials or derivatives of the Materials,
              either in their raw form or as design assets.
            </PageListItem>
            <PageListItem multiline>
              <PageParagraph>
                Using the Materials in a manner which allows end users to build
                their own projects using the Materials or derivatives of the
                Materials.
              </PageParagraph>
              <PageParagraph>
                For example, a website builder, theme, template or starter kit
                where end users can build their own websites using the Materials
                or derivatives of the Materials. This implies that the Materials
                are being resold or redistributed.
              </PageParagraph>
            </PageListItem>
          </PageList>
        </PageSection>
        <PageSection level={2}>
          <PageHeading level={2}>Liability</PageHeading>
          <PageParagraph>
            Ariakit Plus is provided &quot;AS IS&quot;, without any warranties
            of any kind. Ariakit dismisses any liability for damages related to
            this license to the maximum extent permitted by law.
          </PageParagraph>
        </PageSection>
        <PageDivider />
        <PageSection>
          <PageParagraph>
            For any further questions, please contact us at{" "}
            <InlineLink href="mailto:support@ariakit.org">
              support@ariakit.org
            </InlineLink>
            .
          </PageParagraph>
        </PageSection>
      </PageContainer>
    </main>
  );
}
