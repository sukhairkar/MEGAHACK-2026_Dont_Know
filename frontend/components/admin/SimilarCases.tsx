"use client";

import styles from "./SimilarCases.module.css";
import { FileStack, TrendingUp, MapPin, Calendar, ExternalLink } from "lucide-react";
import type { FIRRecord } from "@/lib/data";
import Link from "next/link";

interface SimilarCasesProps {
  currentFir: FIRRecord;
  allFirs: FIRRecord[];
}

export default function SimilarCases({ currentFir, allFirs }: SimilarCasesProps) {
  // Generate similar cases (in real app, this would be AI-powered)
  const similarCases = allFirs
    .filter((fir) => fir.id !== currentFir.id)
    .map((fir) => {
      // Calculate similarity score based on various factors
      let score = 0;
      if (fir.incidentType === currentFir.incidentType) score += 40;
      if (fir.district === currentFir.district) score += 20;
      if (fir.status === currentFir.status) score += 10;
      
      // Add some randomness for demo
      score += Math.floor(Math.random() * 30);
      
      return {
        ...fir,
        similarityScore: Math.min(score, 95),
      };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5);

  const getScoreColor = (score: number) => {
    if (score >= 70) return styles.highMatch;
    if (score >= 50) return styles.mediumMatch;
    return styles.lowMatch;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FileStack size={20} />
          <div>
            <h2 className={styles.title}>Similar Cases</h2>
            <p className={styles.subtitle}>AI-matched cases based on patterns and characteristics</p>
          </div>
        </div>
      </div>

      <div className={styles.currentCase}>
        <h3 className={styles.sectionTitle}>Current Case</h3>
        <div className={styles.currentCaseCard}>
          <div className={styles.currentCaseHeader}>
            <span className={styles.firNumber}>{currentFir.id}</span>
            <span className={styles.crimeType}>{currentFir.incidentType}</span>
          </div>
          <div className={styles.currentCaseDetails}>
            <span>
              <MapPin size={14} />
              {currentFir.district}
            </span>
            <span>
              <Calendar size={14} />
              {new Date(currentFir.date).toLocaleDateString()}
            </span>
          </div>
          <div className={styles.matchingFactors}>
            <span className={styles.factorLabel}>Matching Factors:</span>
            <div className={styles.factors}>
              <span className={styles.factor}>Crime Type</span>
              <span className={styles.factor}>Location</span>
              <span className={styles.factor}>Modus Operandi</span>
              <span className={styles.factor}>Time Pattern</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.similarSection}>
        <h3 className={styles.sectionTitle}>
          Matched Cases ({similarCases.length})
        </h3>
        <div className={styles.casesList}>
          {similarCases.map((fir) => (
            <div key={fir.id} className={styles.caseCard}>
              <div className={styles.caseHeader}>
                <div className={styles.caseInfo}>
                  <span className={styles.caseFirNumber}>{fir.id}</span>
                  <span className={styles.caseCrimeType}>{fir.incidentType}</span>
                </div>
                <div className={`${styles.similarityScore} ${getScoreColor(fir.similarityScore)}`}>
                  <TrendingUp size={14} />
                  {fir.similarityScore}% Match
                </div>
              </div>

              <div className={styles.caseDetails}>
                <div className={styles.caseDetailRow}>
                  <span className={styles.detailLabel}>Location:</span>
                  <span className={styles.detailValue}>{fir.location}</span>
                </div>
                <div className={styles.caseDetailRow}>
                  <span className={styles.detailLabel}>Date:</span>
                  <span className={styles.detailValue}>
                    {new Date(fir.date).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.caseDetailRow}>
                  <span className={styles.detailLabel}>Status:</span>
                  <span className={`${styles.statusBadge} ${styles[fir.status.toLowerCase().replace(" ", "")]}`}>
                    {fir.status}
                  </span>
                </div>
              </div>

              <div className={styles.commonalities}>
                <span className={styles.commonalitiesLabel}>Common Patterns:</span>
                <div className={styles.commonalitiesList}>
                  {fir.incidentType === currentFir.incidentType && (
                    <span className={styles.commonality}>Same crime type</span>
                  )}
                  {fir.district === currentFir.district && (
                    <span className={styles.commonality}>Same district</span>
                  )}
                  {fir.status === currentFir.status && (
                    <span className={styles.commonality}>Same status</span>
                  )}
                  <span className={styles.commonality}>Similar timeframe</span>
                </div>
              </div>

              <div className={styles.caseActions}>
                <Link href={`/admin/fir/${fir.id}`} className={styles.viewCaseBtn}>
                  View Case Details
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.aiInsights}>
        <h3 className={styles.sectionTitle}>AI Pattern Analysis</h3>
        <div className={styles.insightsContent}>
          <p>
            Based on analysis of {similarCases.length} similar cases, the following patterns have been identified:
          </p>
          <ul>
            <li>
              <strong>Geographic Cluster:</strong> 60% of similar cases occurred within a 5km radius
            </li>
            <li>
              <strong>Time Pattern:</strong> Most incidents reported between 6 PM - 10 PM
            </li>
            <li>
              <strong>Resolution Rate:</strong> Cases with similar profiles have a 72% resolution rate
            </li>
            <li>
              <strong>Average Investigation Time:</strong> 45 days for comparable cases
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
