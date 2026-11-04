"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Banknote,
  Bell,
  Building2,
  CalendarDays,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  Users,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import "./admin-shell.css";

type Props = {
  active: "dashboard" | "content" | "applications";
  title: string;
  subtitle: string;
  children: ReactNode;
};

const navigation = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, active: "dashboard" as const },
  { label: "Website content", href: "/admin/asf-tbi", icon: FileText, active: "content" as const },
  { label: "Startup applications", href: "/admin/asf-tbi/applications", icon: Users, active: "applications" as const },
  { label: "Startups", href: "/admin/asf-tbi#content-section-startups", icon: Building2 },
  { label: "Mentors", href: "/admin/asf-tbi#content-section-mentors", icon: Users },
  { label: "Events", href: "/admin/asf-tbi#content-section-events", icon: CalendarDays },
  { label: "Funding opportunities", href: "/admin/asf-tbi#content-section-funding", icon: Banknote },
  { label: "Partners", href: "/admin/asf-tbi#content-section-partners", icon: Building2 },
  { label: "News & media", href: "/admin/asf-tbi#content-section-articles", icon: Newspaper },
  { label: "Enquiries", icon: Inbox, unavailable: true },
  { label: "Reports", href: "/admin#reports", icon: Activity },
  { label: "Settings", icon: Settings, unavailable: true },
];

export default function AdminShell({ active, title, subtitle, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function logout() {
    setLogoutError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) throw new Error("Could not sign out. Please try again.");
      router.push("/admin/login");
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Could not sign out. Please try again.");
    }
  }

  return (
    <div className="admin-frame">
      <aside className={`admin-sidebar${menuOpen ? " admin-sidebar-open" : ""}`}>
        <Link className="admin-brand" href="/admin" onClick={() => setMenuOpen(false)}>
          <span className="admin-brand-mark">ASF</span>
          <span><strong>ASF · TBI</strong><small>ADMIN CONSOLE</small></span>
        </Link>
        <div className="admin-sidebar-caption">WORKSPACE</div>
        <nav className="admin-sidebar-nav" aria-label="Administration">
          {navigation.map(({ label, href, icon: Icon, active: activeKey, unavailable }) => {
            const selected = activeKey ? activeKey === active : href === pathname;
            if (unavailable || !href) {
              return <span key={label} className="admin-nav-link admin-nav-link-unavailable" aria-disabled="true" title={`${label} is not available in the current project.`}>
                <Icon size={18} strokeWidth={1.8} /><span>{label}</span><small>Unavailable</small>
              </span>;
            }
            return (
              <Link
                href={href}
                key={label}
                className={`admin-nav-link${selected ? " admin-nav-link-active" : ""}`}
                aria-current={selected ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
                {label === "Startup applications" && <span className="admin-nav-indicator" />}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-divider" />
        <div className="admin-sidebar-caption">AKGEC OPERATIONS</div>
        <nav className="admin-sidebar-nav" aria-label="AKGEC administration">
          <Link href="/admin/courses" className="admin-nav-link" onClick={() => setMenuOpen(false)}><FileText size={18} /><span>Courses & pricing</span></Link>
          <Link href="/admin/form-fields" className="admin-nav-link" onClick={() => setMenuOpen(false)}><Settings size={18} /><span>Registration forms</span></Link>
          <Link href="/admin/announcement" className="admin-nav-link" onClick={() => setMenuOpen(false)}><Bell size={18} /><span>Announcements</span></Link>
          <Link href="/admin/site-content" className="admin-nav-link" onClick={() => setMenuOpen(false)}><Newspaper size={18} /><span>Main website content</span></Link>
        </nav>
        <div className="admin-sidebar-footer">
          <span className="admin-avatar">A</span>
          <span><strong>Administrator</strong><small>Authenticated session</small></span>
          <button type="button" onClick={() => void logout()} aria-label="Log out"><LogOut size={17} /></button>
        </div>
      </aside>
      {menuOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="Close admin menu" onClick={() => setMenuOpen(false)} />}
      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="admin-menu-toggle" aria-label={menuOpen ? "Close admin menu" : "Open admin menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="admin-topbar-heading"><span>{subtitle}</span><strong>{title}</strong></div>
          <div className="admin-topbar-status"><span />Secure administrator session</div>
        </header>
        {logoutError && <p className="admin-shell-error" role="alert">{logoutError}</p>}
        <div className="admin-content">{children}</div>
        <footer className="admin-footer"><span>AKGEC Skills Foundation · Technology Business Incubator</span><span>Private administration area</span></footer>
      </div>
    </div>
  );
}
