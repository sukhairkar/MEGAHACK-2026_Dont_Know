import styles from "./Benefits.module.css";

const BENEFITS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "Instant AI Analysis",
    description: "AI processes your report in under 3 minutes, identifying applicable IPC sections and generating formal documentation automatically.",
    tag: "Speed",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Secure & Confidential",
    description: "All reports and case data are encrypted and stored on government-secured servers. Your privacy is protected by law.",
    tag: "Security",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    title: "Bilingual FIR Generation",
    description: "FIRs are generated in both English and Marathi, ensuring accessibility across all communities and legal jurisdictions.",
    tag: "Accessibility",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "24/7 Availability",
    description: "File reports anytime, anywhere. The system operates round-the-clock so you are never left without recourse in an emergency.",
    tag: "Always On",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Location-Aware Investigation",
    description: "Geographic intelligence maps nearby CCTV cameras, banks, and traffic signals to assist officers in evidence gathering.",
    tag: "Geo Intelligence",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "Structured Investigation Plans",
    description: "Officers receive prioritised, AI-generated investigation roadmaps with actionable steps — reducing investigation time significantly.",
    tag: "Efficiency",
  },
];

export default function Benefits() {
  return (
    <section className={styles.section} id="benefits" aria-labelledby="benefits-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>Why AI-IAS</div>
          <h2 className={styles.heading} id="benefits-heading">Benefits of the System</h2>
          <p className={styles.subheading}>
            Transforming the way crimes are reported, documented, and investigated through intelligent automation.
          </p>
        </div>
        <div className={styles.grid}>
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className={styles.card}>
              <div className={styles.iconWrap} aria-hidden="true">{benefit.icon}</div>
              <div className={styles.tag}>{benefit.tag}</div>
              <h3 className={styles.cardTitle}>{benefit.title}</h3>
              <p className={styles.cardDesc}>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
