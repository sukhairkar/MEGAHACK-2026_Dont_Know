"use client";

import Link from "next/link";
import styles from "./AdminTopbar.module.css";

interface Props {
  title: string;
  breadcrumb?: { label: string; href?: string }[];
}

export default function AdminTopbar({ title, breadcrumb }: Props) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {breadcrumb && (
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.label}>
                {crumb.href ? (
                  <Link href={crumb.href} className={styles.crumbLink}>{crumb.label}</Link>
                ) : (
                  <span className={styles.crumbCurrent}>{crumb.label}</span>
                )}
                {i < breadcrumb.length - 1 && <span className={styles.crumbSep} aria-hidden="true"> / </span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <div className={styles.dateInfo}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
        <button className={styles.notifBtn} aria-label="Notifications (3 unread)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className={styles.notifBadge} aria-hidden="true">3</span>
        </button>
      </div>
    </header>
  );
}
