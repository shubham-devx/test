import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Bot,
  Boxes,
  Cog,
  Cpu,
  DraftingCompass,
  Factory,
  Flame,
  Gauge,
  Plane,
  ScanLine,
  Wrench,
} from "lucide-react";
import CoeTrainingHeader from "@/components/CoeTrainingHeader";
import { getCentreSlug } from "@/lib/centres";
import { getSiteContent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

const centreIcons = {
  kuka: Bot,
  welding: Flame,
  manufacturing: Factory,
  labview: Gauge,
  rexroth: Cog,
  aia: Cpu,
  plm: Boxes,
  mitsubishi: Cog,
  fab: DraftingCompass,
  bosch: BadgeCheck,
  zeiss: ScanLine,
  janatics: Wrench,
  siemens: Cpu,
  drone: Plane,
  cfc: Factory,
};

function getCentreIcon(name: string) {
  const centre = name.toLowerCase();
  if (centre.includes("kuka")) return centreIcons.kuka;
  if (centre.includes("fronius") || centre.includes("welding")) return centreIcons.welding;
  if (centre.includes("advance manufacturing")) return centreIcons.manufacturing;
  if (centre.includes("labview")) return centreIcons.labview;
  if (centre.includes("rexroth")) return centreIcons.rexroth;
  if (centre.includes("aia")) return centreIcons.aia;
  if (centre.includes("plm")) return centreIcons.plm;
  if (centre.includes("mitsubishi")) return centreIcons.mitsubishi;
  if (centre.includes("fab lab")) return centreIcons.fab;
  if (centre.includes("bosch")) return centreIcons.bosch;
  if (centre.includes("zeiss")) return centreIcons.zeiss;
  if (centre.includes("janatics")) return centreIcons.janatics;
  if (centre.includes("drone")) return centreIcons.drone;
  if (centre.includes("siemens")) return centreIcons.siemens;
  return centreIcons.cfc;
}

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

            <div className="coe-centre-grid">
              {content.centresList.map((centre, index) => (
                (() => {
                  const Icon = getCentreIcon(centre.name);
                  return (
                    <Link
                      className="coe-centre-card"
                      href={`/coe-training/${getCentreSlug(centre.name)}`}
                      key={centre.name}
                    >
                      <span className="coe-card-icon" aria-hidden="true"><Icon size={34} strokeWidth={1.7} /></span>
                      <span className="coe-card-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="coe-card-focus">{centre.focus}</span>
                      <h3>{centre.name}</h3>
                      <p>{centre.description}</p>
                      <span className="coe-card-footer">
                        View courses &amp; details <ArrowUpRight size={17} aria-hidden="true" />
                      </span>
                    </Link>
                  );
                })()
              ))}
            </div>

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
