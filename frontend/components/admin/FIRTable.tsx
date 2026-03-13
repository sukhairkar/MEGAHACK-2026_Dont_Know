"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { FIR_DATA, type FIRRecord, type FIRStatus } from "@/lib/data";
import styles from "./FIRTable.module.css";

const STATUS_COLORS: Record<FIRStatus, string> = {
  "Open": styles.statusOpen,
  "Under Investigation": styles.statusProgress,
  "Closed": styles.statusClosed,
  "Pending": styles.statusPending,
};

const CRIME_TYPES = ["All Types", "Theft / Robbery", "Burglary", "Assault", "Cybercrime / Fraud", "Missing Person"];
const BRANCHES = ["All Branches", "Pune Central", "Baner Police Station", "Shivaji Nagar PS", "Kothrud Police Station", "Hadapsar Police Station"];

interface FIRTableProps {
  firs?: FIRRecord[];
}

export default function FIRTable({ firs }: FIRTableProps) {
  const sourceData = firs || FIR_DATA;
  const [search, setSearch] = useState("");
  const [crimeFilter, setCrimeFilter] = useState("All Types");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let data = [...sourceData];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.incidentType.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.assignedOfficer.toLowerCase().includes(q)
      );
    }
    if (crimeFilter !== "All Types") data = data.filter((r) => r.incidentType === crimeFilter);
    if (branchFilter !== "All Branches") data = data.filter((r) => r.branch === branchFilter);
    data.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === "asc" ? diff : -diff;
    });
    return data;
  }, [sourceData, search, crimeFilter, branchFilter, sortDir]);

  return (
    <div className={styles.wrapper}>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            className={styles.search}
            placeholder="Search by FIR ID, crime type, location, officer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search FIR records"
          />
        </div>
        <div className={styles.filters}>
          <select className={styles.select} value={crimeFilter} onChange={(e) => setCrimeFilter(e.target.value)} aria-label="Filter by crime type">
            {CRIME_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select className={styles.select} value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} aria-label="Filter by police branch">
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
          <button
            className={styles.sortBtn}
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            aria-label={`Sort by date ${sortDir === "asc" ? "descending" : "ascending"}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {sortDir === "asc" ? (
                <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>
              ) : (
                <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>
              )}
            </svg>
            Date {sortDir === "asc" ? "ASC" : "DESC"}
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className={styles.resultCount}>
        Showing <strong>{filtered.length}</strong> of <strong>{sourceData.length}</strong> cases
      </div>

      {/* Table */}
      <div className={styles.tableWrap} role="region" aria-label="FIR cases table" tabIndex={0}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">FIR ID</th>
              <th scope="col">Incident Type</th>
              <th scope="col">Location</th>
              <th scope="col">Date</th>
              <th scope="col">Status</th>
              <th scope="col">Assigned Officer</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyRow}>
                  No cases match your search criteria.
                </td>
              </tr>
            ) : (
              filtered.map((fir: FIRRecord) => (
                <tr key={fir.id} className={styles.row}>
                  <td>
                    <span className={styles.firId}>{fir.id}</span>
                  </td>
                  <td>
                    <span className={styles.incidentType}>{fir.incidentType}</span>
                  </td>
                  <td>
                    <div className={styles.locationCell}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      {fir.location}
                    </div>
                  </td>
                  <td>
                    <time dateTime={fir.date} className={styles.date}>
                      {new Date(fir.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </time>
                  </td>
                  <td>
                    <span className={`${styles.status} ${STATUS_COLORS[fir.status]}`}>
                      {fir.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.officerCell}>
                      <div className={styles.officerAvatar} aria-hidden="true">
                        {fir.assignedOfficer.split(" ").slice(-1)[0].charAt(0)}
                      </div>
                      {fir.assignedOfficer}
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/fir/${fir.id}`} className={styles.viewBtn}>
                      View Details
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
