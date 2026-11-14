import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
          <Link href="/coe-training">
            {centreLabel} <ChevronRight size={15} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
