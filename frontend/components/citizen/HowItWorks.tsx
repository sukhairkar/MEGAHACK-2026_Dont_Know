import styles from "./HowItWorks.module.css";

const STEPS = [
  {
    number: "01",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Submit Your Report",
    description: "Fill out the incident report form with details of the event — location, description, suspect details, and any evidence you can provide.",
  },
  {
    number: "02",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M20.188 10.934c.2.388.312.822.312 1.066s-.112.678-.312 1.066L19 15c-.468.856-.136 1.958.72 2.426l.192.108a2 2 0 0 1 .728 2.728l-1 1.732a2 2 0 0 1-2.728.728L16 21.726C15.398 21.37 14.66 21.37 14 21.726l-1 .572a2 2 0 0 1-2.728-.728l-1-1.732a2 2 0 0 1 .728-2.728l.192-.108C11.05 16.574 11.382 15.472 10.914 14.614 10.508 13.866 10.002 13.044 9.914 12s.008-1.866.414-2.614c.468-.858.136-1.96-.72-2.428l-.192-.108a2 2 0 0 1-.728-2.728l1-1.732a2 2 0 0 1 2.728-.728l.192.108c.602.356 1.34.356 2-.002l1-.572a2 2 0 0 1 2.728.728l1 1.732a2 2 0 0 1-.728 2.728l-.192.108C18.636 7.042 18.304 8.144 18.772 9.002L20 11z" />
      </svg>
    ),
    title: "AI Analysis",
    description: "Our AI system analyses your report, identifies applicable IPC sections, and generates a formal FIR in both English and Marathi.",
  },
  {
    number: "03",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Officer Assignment",
    description: "The FIR is automatically routed to the appropriate police station and assigned to an investigating officer based on jurisdiction and case type.",
  },
  {
    number: "04",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Investigation Begins",
    description: "Officers receive an AI-generated investigation roadmap with prioritised steps, evidence leads, and relevant IPC section guidance.",
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.section} id="how-it-works" aria-labelledby="how-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>Process</div>
          <h2 className={styles.heading} id="how-heading">How It Works</h2>
          <p className={styles.subheading}>
            A transparent, technology-driven process that connects citizens with law enforcement quickly and efficiently.
          </p>
        </div>
        <div className={styles.steps}>
          {STEPS.map((step, index) => (
            <div key={step.number} className={styles.step}>
              <div className={styles.stepNumber}>{step.number}</div>
              {index < STEPS.length - 1 && <div className={styles.connector} aria-hidden="true" />}
              <div className={styles.card}>
                <div className={styles.icon} aria-hidden="true">{step.icon}</div>
                <h3 className={styles.cardTitle}>{step.title}</h3>
                <p className={styles.cardDesc}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
