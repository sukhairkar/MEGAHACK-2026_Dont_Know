"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" className={styles.brand}>
          <img 
            src="/justiceRoute-logo.png" 
            alt="JusticeRoute logo" 
            width="32" 
            height="32"
            className={styles.logo}
          />
          <div className={styles.brandText}>
            <span className={styles.brandMain}>JusticeRoute</span>
            <span className={styles.brandSub}>Investigation Platform</span>
          </div>
        </Link>

        <button
          className={styles.menuToggle}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </button>

        <ul className={`${styles.navLinks} ${menuOpen ? styles.navOpen : ""}`} role="list">
          <li><Link href="/#how-it-works" className={styles.navLink} onClick={() => setMenuOpen(false)}>How It Works</Link></li>
          <li><Link href="/#benefits" className={styles.navLink} onClick={() => setMenuOpen(false)}>Benefits</Link></li>
          <li><Link href="/report" className={styles.navLink} onClick={() => setMenuOpen(false)}>File Report</Link></li>
          <li>
            <Link href="/admin/login" className={styles.adminBtn} onClick={() => setMenuOpen(false)}>
              Police Login
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
