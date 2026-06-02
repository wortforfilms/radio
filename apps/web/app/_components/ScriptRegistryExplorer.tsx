"use client";

import { useMemo, useState } from "react";

export type ScriptStyleRecord = {
  id: string;
  label: string;
  location: string;
  sourceCitation: string | null;
  verificationStatus: string;
  sample: string | null;
  hindiTransliteration: string | null;
  sanskritTranslation: string | null;
  fontStack: string | null;
  styleName: string | null;
  direction: "ltr" | "rtl";
};

export type ScriptRegistryRecord = {
  id: string;
  label: string;
  sourceCitation: string | null;
  verificationStatus: string;
  code: string | null;
  numeric: string | null;
  pva: string | null;
  unicodeVersion: string | null;
  date: string | null;
};

type SortKey = "label" | "code" | "numeric" | "unicodeVersion" | "date" | "verificationStatus";

type Props = {
  requestedCapacity: number;
  registryRecords: ScriptRegistryRecord[];
  styleRecords: ScriptStyleRecord[];
};

function compareValue(a: string | null, b: string | null) {
  return (a ?? "NULL").localeCompare(b ?? "NULL", undefined, { numeric: true, sensitivity: "base" });
}

export default function ScriptRegistryExplorer({ requestedCapacity, registryRecords, styleRecords }: Props) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("label");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [pvaFilter, setPvaFilter] = useState<"all" | "with-pva" | "null-pva">("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const statuses = useMemo(() => Array.from(new Set(registryRecords.map((record) => record.verificationStatus))).sort(), [registryRecords]);

  const filteredRegistry = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = registryRecords.filter((record) => {
      const searchable = [
        record.label,
        record.code,
        record.numeric,
        record.pva,
        record.unicodeVersion,
        record.date,
        record.verificationStatus
      ].join(" ").toLowerCase();
      const matchesQuery = normalizedQuery ? searchable.includes(normalizedQuery) : true;
      const matchesPva = pvaFilter === "all" || (pvaFilter === "with-pva" ? Boolean(record.pva) : !record.pva);
      const matchesStatus = statusFilter === "all" || record.verificationStatus === statusFilter;
      return matchesQuery && matchesPva && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const result = compareValue(String(a[sortKey] ?? ""), String(b[sortKey] ?? ""));
      return direction === "asc" ? result : -result;
    });
  }, [direction, pvaFilter, query, registryRecords, sortKey, statusFilter]);

  const filteredSamples = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return styleRecords.filter((record) => {
      if (!normalizedQuery) {
        return true;
      }

      return [
        record.label,
        record.location,
        record.sample,
        record.hindiTransliteration,
        record.sanskritTranslation,
        record.styleName,
        record.direction
      ].join(" ").toLowerCase().includes(normalizedQuery);
    });
  }, [query, styleRecords]);

  return (
    <section className="script-registry-panel">
      <div className="reference-feed-head">
        <div>
          <p className="section-kicker">ISO 15924 Registry</p>
          <h2>All Sourced Script Codes</h2>
        </div>
        <span>{filteredRegistry.length} shown / {registryRecords.length} sourced / {requestedCapacity} requested</span>
      </div>
      <p className="reference-feed-note">
        Filter and sort the official script-code registry. Script samples expose Hindi transliteration and Sanskrit translation fields, with `NULL` where no sourced value is stored.
      </p>

      <div className="script-registry-controls" aria-label="Script registry filters">
        <label>
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, code, PVA, Unicode..." />
        </label>
        <label>
          <span>Sort</span>
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
            <option value="label">Name</option>
            <option value="code">Code</option>
            <option value="numeric">Numeric</option>
            <option value="unicodeVersion">Unicode</option>
            <option value="date">Date</option>
            <option value="verificationStatus">Status</option>
          </select>
        </label>
        <label>
          <span>Order</span>
          <select value={direction} onChange={(event) => setDirection(event.target.value as "asc" | "desc")}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
        <label>
          <span>PVA</span>
          <select value={pvaFilter} onChange={(event) => setPvaFilter(event.target.value as "all" | "with-pva" | "null-pva")}>
            <option value="all">All</option>
            <option value="with-pva">With PVA</option>
            <option value="null-pva">NULL PVA</option>
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="script-sample-table-wrap">
        <table className="script-sample-table">
          <caption>Script samples with Hindi transliteration and Sanskrit translation fields</caption>
          <thead>
            <tr>
              <th>Script</th>
              <th>Sample</th>
              <th>Hindi Transliteration</th>
              <th>Sanskrit Translation</th>
              <th>Direction</th>
            </tr>
          </thead>
          <tbody>
            {filteredSamples.map((record) => (
              <tr key={record.id}>
                <td>{record.label}</td>
                <td dir={record.direction} style={{ fontFamily: record.fontStack ?? undefined }}>{record.sample ?? "NULL"}</td>
                <td>{record.hindiTransliteration ?? "NULL"}</td>
                <td>{record.sanskritTranslation ?? "NULL"}</td>
                <td>{record.direction.toUpperCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="script-registry-grid">
        {filteredRegistry.map((record) => (
          <a className="script-registry-card" href={record.sourceCitation ?? "/api/knowledge-graph"} key={record.id} rel="noreferrer" target="_blank">
            <span>{record.code ?? "NULL"} / {record.numeric ?? "NULL"}</span>
            <strong>{record.label}</strong>
            <p>PVA: {record.pva ?? "NULL"} / Unicode: {record.unicodeVersion ?? "NULL"} / Date: {record.date ?? "NULL"}</p>
            <small>{record.verificationStatus}</small>
          </a>
        ))}
      </div>
    </section>
  );
}
