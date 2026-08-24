import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AKGEC Skills Foundation | Skill Development & Industry Training",
  description:
    "AKGEC Skills Foundation provides industry-oriented training, Centres of Excellence, advanced technology programs and industrial skill development.",
  keywords: [
    "AKGEC Skills Foundation",
    "skill development",
    "industrial training",
    "robotics training",
    "automation training",
    "KUKA training",
    "Bosch Rexroth training",
    "Siemens training",
    "Ghaziabad",
    "Uttar Pradesh",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}