import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getCentreSlug } from "@/lib/centres";
import { getSiteContent } from "@/lib/siteContent";

export default async function CoeTrainingHeader() {
  const content = await getSiteContent();
  const centreLabel = content.navigation.find((item) => item.section === "centres")?.label ?? "COE / Training";

  return (
    <header className="coe-page-header">
      <div className="coe-page-header-inner">
        <Link href="/" className="coe-page-brand">
          <Image src="/logo/asf-logo.png" alt="" width={52} height={52} />
          <span>AKGEC Skills Foundation</span>
        </Link>
        <nav aria-label="Main navigation">
          <details className="coe-header-dropdown">
            <summary>
              {centreLabel} <ChevronDown size={15} aria-hidden="true" />
            </summary>
            <div className="coe-header-menu">
              <span>Choose a centre</span>
              {content.centresList.map((centre, index) => (
                <Link
                  href={`/coe-training/${getCentreSlug(centre.name)}`}
                  key={centre.name}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {centre.name}
                  <ChevronRight size={15} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
