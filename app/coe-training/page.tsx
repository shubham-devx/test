import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CoeCentreCarousel from "@/components/CoeCentreCarousel";
import CoeTrainingHeader from "@/components/CoeTrainingHeader";
import { getCentreImage, getCentreSlug } from "@/lib/centres";
import { getSiteContent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

export default async function CoeTrainingPage() {
  const content = await getSiteContent();

  return (
    <div className="coe-page">
      <CoeTrainingHeader />
      <main>
        <section className="coe-directory-hero">
          <div className="coe-page-container">
            <Link href="/" className="coe-breadcrumb">
              <ArrowLeft size={15} aria-hidden="true" /> Back to ASF home
            </Link>
            <span className="coe-eyebrow">{content.training.label}</span>
            <h1>{content.training.heading}</h1>
            <p>{content.training.description}</p>
            <div className="coe-directory-count">
              <strong>{content.centresList.length}</strong>
              <span>centres and academies</span>
            </div>
          </div>
        </section>

        <section className="coe-directory-section">
          <div className="coe-page-container">
            <div className="coe-directory-heading">
              <div>
                <span className="coe-eyebrow">{content.centres.label}</span>
                <h2>{content.centres.heading}</h2>
              </div>
              <p>{content.centres.description}</p>
            </div>

            <CoeCentreCarousel
              centres={content.centresList.map((centre) => ({
                name: centre.name,
                focus: centre.focus,
                description: centre.description,
                href: `/coe-training/${getCentreSlug(centre.name)}`,
                image: centre.image || getCentreImage(centre.name),
              }))}
            />

          </div>
        </section>
      </main>
      <footer className="coe-page-footer">
        <div className="coe-page-container">
          <Image src="/logo/asf-logo.png" alt="" width={32} height={32} />
          <span>AKGEC Skills Foundation</span>
        </div>
      </footer>
    </div>
  );
}
