import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

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
    <html lang="en" className={`${dmSans.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}