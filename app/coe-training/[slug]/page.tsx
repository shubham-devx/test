import BoschRexrothCentreProfile from "@/components/BoschRexrothCentreProfile";
import DetailedCentreProfile from "@/components/DetailedCentreProfile";
import FroniusCentreProfile from "@/components/FroniusCentreProfile";
import KukaCentreProfile from "@/components/KukaCentreProfile";
import NiLabviewCentreProfile from "@/components/NiLabviewCentreProfile";
import SiemensPlmCentreProfile from "@/components/SiemensPlmCentreProfile";
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

  if (slug === "kuka-industrial-robotics-training-centre") {
    return <KukaCentreProfile centre={centre} course={course} />;
  }
  if (slug === "fronius-advance-welding-technology-and-research-centre") {
    return <FroniusCentreProfile centre={centre} course={course} />;
  }
  if (slug === "siemens-plm-centre-of-excellence") {
    return <SiemensPlmCentreProfile centre={centre} course={course} />;
  }
  if (slug === "ni-labview-academy") {
    return <NiLabviewCentreProfile centre={centre} course={course} />;
  }
  if (slug === "bosch-rexroth-centre-of-competence-in-automation-technologies") {
    return <BoschRexrothCentreProfile centre={centre} course={course} />;
  }

  return <DetailedCentreProfile centre={centre} course={course} />;
}
