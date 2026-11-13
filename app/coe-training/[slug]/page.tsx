import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import CentreRegistrationAction from "@/components/CentreRegistrationAction";
import CoeTrainingHeader from "@/components/CoeTrainingHeader";
import { getCentreSlug, getCourseForCentre } from "@/lib/centres";
import { getCourses } from "@/lib/courses";
import { getSiteContent } from "@/lib/siteContent";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CentreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, content, courses] = await Promise.all([
    params,
    getSiteContent(),
    getCourses(),
  ]);
  const centre = content.centresList.find((item) => getCentreSlug(item.name) === slug);

  if (!centre) notFound();

  const course = getCourseForCentre(centre, courses);

  return (
    <div className="coe-page">
      <CoeTrainingHeader />
      <main className="coe-detail-main">
        <div className="coe-page-container">
          <Link href="/coe-training" className="coe-breadcrumb">
            <ArrowLeft size={16} aria-hidden="true" /> All centres &amp; training
          </Link>

          <section className="coe-detail-hero">
            <span className="coe-eyebrow">{centre.focus}</span>
            <h1>{centre.name}</h1>
            <p>{centre.description}</p>
            <div className="coe-detail-meta">
              <span><strong>Industry partner</strong>{centre.partner}</span>
              <span><strong>Centre focus</strong>{centre.focus}</span>
            </div>
          </section>

          <div className="coe-detail-grid">
            <section className="coe-detail-panel">
              <span className="coe-eyebrow">LEARN &amp; PRACTISE</span>
              <h2>{centre.itemsTitle}</h2>
              {centre.items.length > 0 ? (
                <ul className="coe-programme-list">
                  {centre.items.map((item) => (
                    <li key={item}><CheckCircle2 size={18} aria-hidden="true" />{item}</li>
                  ))}
                </ul>
              ) : (
                <p>Programme details are available from the ASF training team.</p>
              )}
              {centre.details && centre.details.length > 0 && (
                <div className="coe-centre-details">
                  <h3>Centre overview</h3>
                  {centre.details.map((detail) => <p key={detail}>{detail}</p>)}
                </div>
              )}
              <div className="coe-recognition">
                <h3>Recognitions &amp; certifications</h3>
                <p>{centre.recognition}</p>
              </div>
            </section>

            <aside className="coe-fees-panel">
              <span className="coe-eyebrow">COURSES &amp; FEES</span>
              <h2>Plan your training</h2>
              {course ? (
                <>
                  <p className="coe-catalogue-course">{course.name}</p>
                  <div className="coe-fee-list">
                    {course.durations.map((duration) => (
                      <div className="coe-fee-row" key={duration.label}>
                        <span>{duration.label}</span>
                        <strong>₹{duration.fee.toLocaleString("en-IN")}</strong>
                      </div>
                    ))}
                  </div>
                  <p className="coe-fee-note">Fees and durations reflect the current ASF course catalogue.</p>
                </>
              ) : (
                <p className="coe-fee-note">
                  Current course fees and schedules are not listed for this centre. Contact ASF for
                  the latest details.
                </p>
              )}
              <CentreRegistrationAction centreName={centre.name} courseName={course?.name} />
              <p className="coe-fee-footnote">For the latest batch dates and eligibility, contact the ASF team.</p>
            </aside>
          </div>
        </div>
      </main>
      <footer className="coe-page-footer">
        <div className="coe-page-container">
          <Link href="/coe-training"><ArrowLeft size={16} aria-hidden="true" /> Return to all centres</Link>
        </div>
      </footer>
    </div>
  );
}
