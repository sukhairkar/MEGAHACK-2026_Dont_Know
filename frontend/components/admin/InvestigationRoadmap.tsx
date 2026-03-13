"use client";

import { useState, useMemo } from "react";
import styles from "./InvestigationRoadmap.module.css";
import {
  Route,
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { FIRRecord } from "@/lib/data";

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending" | "blocked";
  assignee?: string;
  dueDate?: string;
  substeps?: { id: string; title: string; completed: boolean }[];
}

interface InvestigationRoadmapProps {
  fir: FIRRecord;
}

export default function InvestigationRoadmap({ fir }: InvestigationRoadmapProps) {
  const [expandedSteps, setExpandedSteps] = useState<string[]>(["step-1"]);

  // Generate roadmap steps from FIR investigation steps
  const roadmapSteps: RoadmapStep[] = useMemo(() => {
    return fir.investigationSteps.map((step, index) => {
      const getStatus = (): RoadmapStep["status"] => {
        if (step.completed) return "completed";
        // First incomplete step is in-progress
        const firstIncompleteIndex = fir.investigationSteps.findIndex(s => !s.completed);
        if (index === firstIncompleteIndex) return "in-progress";
        // Steps after in-progress are pending
        return "pending";
      };

      return {
        id: `step-${step.step}`,
        title: step.action,
        description: step.details,
        status: getStatus(),
        assignee: fir.assignedOfficer,
        substeps: [
          { id: `${step.step}-1`, title: `Complete ${step.action.toLowerCase()}`, completed: step.completed },
          { id: `${step.step}-2`, title: "Document findings", completed: step.completed },
          { id: `${step.step}-3`, title: "Update case file", completed: step.completed },
        ],
      };
    });
  }, [fir]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={20} />;
      case "in-progress":
        return <Clock size={20} />;
      case "blocked":
        return <AlertTriangle size={20} />;
      default:
        return <Circle size={20} />;
    }
  };

  const completedSteps = roadmapSteps.filter((s) => s.status === "completed").length;
  const progress = (completedSteps / roadmapSteps.length) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Route size={20} />
          <div>
            <h2 className={styles.title}>Investigation Roadmap</h2>
            <p className={styles.subtitle}>AI-generated investigation workflow</p>
          </div>
        </div>
        <button className={styles.addStepBtn}>
          <Plus size={16} />
          Add Step
        </button>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressInfo}>
          <span className={styles.progressLabel}>Overall Progress</span>
          <span className={styles.progressValue}>{completedSteps} of {roadmapSteps.length} steps completed</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={styles.timeline}>
        {roadmapSteps.map((step, index) => (
          <div
            key={step.id}
            className={`${styles.timelineItem} ${styles[step.status]}`}
          >
            <div className={styles.timelineConnector}>
              <div className={styles.timelineIcon}>{getStatusIcon(step.status)}</div>
              {index < roadmapSteps.length - 1 && <div className={styles.timelineLine} />}
            </div>

            <div className={styles.timelineContent}>
              <button
                className={styles.stepHeader}
                onClick={() => toggleStep(step.id)}
                aria-expanded={expandedSteps.includes(step.id)}
              >
                <div className={styles.stepInfo}>
                  <span className={styles.stepNumber}>Step {index + 1}</span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
                <div className={styles.stepMeta}>
                  <span className={`${styles.statusBadge} ${styles[step.status]}`}>
                    {step.status.replace("-", " ")}
                  </span>
                  {expandedSteps.includes(step.id) ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
              </button>

              {expandedSteps.includes(step.id) && (
                <div className={styles.stepDetails}>
                  {step.assignee && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Assigned to:</span>
                      <span className={styles.detailValue}>{step.assignee}</span>
                    </div>
                  )}
                  {step.dueDate && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Due date:</span>
                      <span className={styles.detailValue}>
                        {new Date(step.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {step.substeps && (
                    <div className={styles.substeps}>
                      <span className={styles.substepsLabel}>Checklist:</span>
                      <ul className={styles.substepsList}>
                        {step.substeps.map((substep) => (
                          <li
                            key={substep.id}
                            className={substep.completed ? styles.completed : ""}
                          >
                            <span className={styles.checkbox}>
                              {substep.completed ? (
                                <CheckCircle size={14} />
                              ) : (
                                <Circle size={14} />
                              )}
                            </span>
                            {substep.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
