import { PageContainer } from "app/(main)/page-container.jsx";
import { InlineLink } from "components/inline-link.jsx";
import {
  PageDivider,
  PageHeading,
  PageList,
  PageListItem,
  PageParagraph,
  PageSection,
} from "components/page-elements.jsx";
import Link from "next/link.js";
import { getNextPageMetadata } from "utils/get-next-page-metadata.js";

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
          <InlineLink render={<Link href="/tags/new" />}>
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
            As a Licensee, you&apos;re permitted to use the Materials for any
            purpose, provided it doesn&apos;t compete with Ariakit Plus:
          </PageParagraph>
          <PageList>
            <PageListItem>
              Use the Materials to create unlimited end products.
            </PageListItem>
            <PageListItem>
              Modify the Materials to create derivative works. Such modified
              works are subject to this license.
            </PageListItem>
            <PageListItem>
              Use the Materials to create end products for an unlimited number
              of clients.
            </PageListItem>
            <PageListItem>
              Use the Materials to create end products for sale to end users.
            </PageListItem>
          </PageList>
        </PageSection>
        <PageSection level={2}>
          <PageHeading level={2}>Restrictions</PageHeading>
          <PageParagraph>You are expressly prohibited from:</PageParagraph>
          <PageList>
            <PageListItem>
              Utilizing the Materials in a manner which allows end users to
              build their own end products using the Materials or derivatives of
              the Materials.
            </PageListItem>
            <PageListItem>
              Redistributing the Materials or derivatives of the Materials,
              either in their raw form or as design assets, outside of an end
              product.
            </PageListItem>
            <PageListItem>
              Sharing your access to the Materials with any other individual.
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
