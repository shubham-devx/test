"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import RegistrationModal from "@/components/RegistrationModal";

const ADMIN_WHATSAPP = "917518681245";

export default function CentreRegistrationAction({
  centreName,
  courseName,
}: {
  centreName: string;
  courseName?: string;
}) {
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const message = `Hello AKGEC Skills Foundation, I would like to enquire about registration and fees for ${centreName}.`;
  const contactUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;

  if (!courseName) {
    return (
      <a className="coe-register-button" href={contactUrl} target="_blank" rel="noreferrer">
        Register / enquire about fees <ArrowUpRight size={17} aria-hidden="true" />
      </a>
    );
  }

  return (
    <>
      <button className="coe-register-button" type="button" onClick={() => setRegistrationOpen(true)}>
        Register for this course <ArrowUpRight size={17} aria-hidden="true" />
      </button>
      <RegistrationModal
        isOpen={registrationOpen}
        initialCourseName={courseName}
        onClose={() => setRegistrationOpen(false)}
      />
    </>
  );
}
