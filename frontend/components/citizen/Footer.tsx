import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <img 
              src="/justiceRoute-logo.png" 
              alt="JusticeRoute logo" 
              width="28" 
              height="28"
              className={styles.logo}
            />
            <div>
              <div className={styles.brandName}>JusticeRoute</div>
              <div className={styles.brandDesc}>Investigation Platform</div>
            </div>
          </div>
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h3>Citizens</h3>
              <Link href="/report">File a Report</Link>
              <Link href="/#how-it-works">How It Works</Link>
            </div>
            <div className={styles.linkGroup}>
              <h3>Police</h3>
              <Link href="/admin/login">Officer Login</Link>
              <Link href="/admin/dashboard">Dashboard</Link>
            </div>
            <div className={styles.linkGroup}>
              <h3>Legal</h3>
              <Link href="#">Privacy Policy</Link>
              <Link href="#">Terms of Use</Link>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>© 2024 Government of Maharashtra — Police Department. All rights reserved.</p>
          <p className={styles.disclaimer}>This system is for official use. Misuse may result in legal action.</p>
        </div>
      </div>
    </footer>
  );
}
