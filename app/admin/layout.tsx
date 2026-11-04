import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  applicationName: "ASF-TBI Admin",
  manifest: "/asf-tbi-admin.webmanifest",
  icons: {
    icon: "/asf-tbi-admin-icon-512.png",
    apple: "/asf-tbi-admin-icon-180.png",
  },
  appleWebApp: {
    capable: true,
    title: "ASF-TBI Admin",
    statusBarStyle: "black-translucent",
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
