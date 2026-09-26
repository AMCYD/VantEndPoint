"use client";

import React, { useEffect, useState, useMemo } from "react";
import CyberDataGrid from "@/components/CyberDataGrid";
import { ReportsService, SecurityReportItem } from "@/services/api";
import { ColDef } from "ag-grid-community";
import { FileText, Plus, Download, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ReportsPage() {
  const [rowData, setRowData] = useState<SecurityReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const fetchReports = () => {
    setLoading(true);
    setError(null);
    ReportsService.getReports()
      .then((data) => {
        setRowData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching reports:", err);
        setError(err.message || "Failed to load reports archive.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      await ReportsService.createReport({
        title: `Endpoint Incident Forensics Snapshot - ${new Date().toLocaleDateString()}`,
        report_type: "Forensic Investigation",
      });
      fetchReports();
    } catch (err: any) {
      alert(`Error generating report: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report: SecurityReportItem) => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VantEndpoint_Report_${report.id}_${report.created_at.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columnDefs = useMemo<ColDef<SecurityReportItem>[]>(
    () => [
      {
        field: "id",
        headerName: "Report ID",
        width: 105,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-cyan-400 font-semibold">REP-{params.value}</span>
        ),
      },
      {
        field: "title",
        headerName: "Report Title",
        flex: 1.5,
        cellRenderer: (params: any) => (
          <div className="flex items-center space-x-2 py-1">
            <FileText size={14} className="text-slate-400" />
            <span className="font-semibold text-xs text-slate-100">{params.value}</span>
          </div>
        ),
      },
      {
        field: "report_type",
        headerName: "Type",
        width: 150,
        cellRenderer: (params: any) => (
          <span className="text-xs text-slate-300 font-mono">{params.value}</span>
        ),
      },
      {
        field: "risk_score",
        headerName: "Assessed Risk",
        width: 130,
        cellRenderer: (params: any) => {
          const score = params.value || 0;
          return (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                score >= 70
                  ? "bg-red-950/70 text-red-400 border border-red-800"
                  : score >= 35
                  ? "bg-amber-950/70 text-amber-400 border border-amber-800"
                  : "bg-emerald-950/50 text-emerald-400 border border-emerald-800"
              }`}
            >
              SCORE {score}/100
            </span>
          );
        },
      },
      {
        field: "summary",
        headerName: "Executive Summary",
        flex: 2,
        cellRenderer: (params: any) => (
          <span className="text-xs text-slate-400 truncate block" title={params.value}>
            {params.value}
          </span>
        ),
      },
      {
        field: "created_at",
        headerName: "Generated At",
        width: 160,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-400">{params.value}</span>
        ),
      },
      {
        headerName: "Export",
        width: 100,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => (
          <button
            onClick={() => handleDownload(params.data)}
            className="flex items-center space-x-1 text-xs px-2.5 py-1 bg-cyber-surface hover:bg-slate-800 text-cyan-300 rounded border border-cyber-border transition-colors"
            title="Download JSON Report"
          >
            <Download size={13} />
            <span>JSON</span>
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="text-cyber-accent" size={24} />
            Investigation Reports & DFIR Audits
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate, archive, and export comprehensive forensic audit reports for incident responders and SOC analysts.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="flex items-center space-x-2 text-xs font-semibold px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md shadow transition-all disabled:opacity-50"
        >
          <Plus size={15} />
          <span>{generating ? "Compiling Forensic Snapshot..." : "Generate New Audit Report"}</span>
        </button>
      </div>

      <CyberDataGrid<SecurityReportItem>
        title="Archived Investigation Reports"
        subtitle="Snapshot records and threat assessments"
        rowData={rowData}
        columnDefs={columnDefs}
        loading={loading}
        error={error}
        onRefresh={fetchReports}
        height="calc(100vh - 220px)"
      />
    </div>
  );
}
