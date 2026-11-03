import type { Metadata } from "next";
import "./asf-tbi.css";
import AsfTbiWebsite from "@/components/AsfTbiWebsite";
import { getAsfTbiContent } from "@/lib/asfTbiContent";

export const metadata: Metadata = {
  title: "ASF-TBI | AKGEC Skills Foundation",
  description:
    "Discover incubation programs, founder resources and startup support at the AKGEC Skills Foundation Technology Business Incubator.",
};

export const dynamic = "force-dynamic";

export default async function AsfTbiPage() {
  const content = await getAsfTbiContent();
  return <AsfTbiWebsite content={content} />;
}
