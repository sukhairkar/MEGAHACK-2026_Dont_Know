import Link from "next/link";
import Image from "next/image";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.hero} aria-label="Hero section">
      <div className={styles.overlay} aria-hidden="true" />
      <Image
        src="/images/hero-police.jpg"
        alt="Police department building"
        fill
        priority
        className={styles.bgImage}
        sizes="100vw"
      />
      <div className={styles.content}>
        <div className={styles.badge}>Government of Maharashtra — Police Department</div>
        <h1 className={styles.heading}>
          AI-Powered Investigation<br />
          <span className={styles.accent}>Assistance System</span>
        </h1>
        <p className={styles.subheading}>
          Empowering law enforcement with artificial intelligence. File incident reports instantly,
          receive AI-generated FIRs, suggested IPC sections, and structured investigation roadmaps.
        </p>
        <div className={styles.actions}>
          <Link href="/report" className={styles.primaryBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            Report an Incident
          </Link>
          <Link href="/#how-it-works" className={styles.secondaryBtn}>
            Learn How It Works
          </Link>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>12,400+</span>
            <span className={styles.statLabel}>Reports Filed</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>98.2%</span>
            <span className={styles.statLabel}>AI Accuracy</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>3 min</span>
            <span className={styles.statLabel}>Avg. Processing</span>
          </div>
        </div>
      </div>
    </section>
  );
}
