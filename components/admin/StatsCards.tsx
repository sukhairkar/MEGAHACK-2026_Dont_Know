"use client";

import styles from "./StatsCards.module.css";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: { value: number; isUp: boolean };
  variant: "total" | "open" | "progress" | "closed";
}

function StatCard({ title, value, icon, trend, variant }: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.iconWrap}>{icon}</div>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>{value}</span>
        {trend && (
          <span className={`${styles.trend} ${trend.isUp ? styles.up : styles.down}`}>
            {trend.isUp ? "+" : ""}{trend.value}% from last month
          </span>
        )}
      </div>
    </div>
  );
}

interface StatsCardsProps {
  stats: {
    total: number;
    open: number;
    inProgress: number;
    closed: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className={styles.grid}>
      <StatCard
        title="Total FIRs"
        value={stats.total}
        icon={<FileText size={24} />}
        trend={{ value: 12, isUp: true }}
        variant="total"
      />
      <StatCard
        title="Open Cases"
        value={stats.open}
        icon={<AlertTriangle size={24} />}
        trend={{ value: 8, isUp: true }}
        variant="open"
      />
      <StatCard
        title="Under Investigation"
        value={stats.inProgress}
        icon={<Clock size={24} />}
        trend={{ value: 5, isUp: false }}
        variant="progress"
      />
      <StatCard
        title="Closed Cases"
        value={stats.closed}
        icon={<CheckCircle size={24} />}
        trend={{ value: 15, isUp: true }}
        variant="closed"
      />
    </div>
  );
}
