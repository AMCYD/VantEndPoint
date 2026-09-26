"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, ColDef, GridApi } from "ag-grid-community";
import { Search, Download, RefreshCw, AlertCircle, Database } from "lucide-react";

// Ensure community modules are registered client-side
if (typeof window !== "undefined") {
  ModuleRegistry.registerModules([AllCommunityModule]);
}

interface CyberDataGridProps<T = any> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  title?: string;
  subtitle?: string;
  paginationPageSize?: number;
  height?: string | number;
  emptyMessage?: string;
  actions?: React.ReactNode;
}

export default function CyberDataGrid<T = any>({
  rowData = [],
  columnDefs,
  loading = false,
  error = null,
  onRefresh,
  title,
  subtitle,
  paginationPageSize = 50,
  height = "calc(100vh - 240px)",
  emptyMessage = "No records found matching criteria.",
  actions,
}: CyberDataGridProps<T>) {
  const [mounted, setMounted] = useState(false);
  const [quickFilterText, setQuickFilterText] = useState("");
  const gridRef = useRef<AgGridReact<T>>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: false,
    }),
    []
  );

  const handleExportCsv = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `${title ? title.toLowerCase().replace(/\s+/g, "_") : "export"}_${new Date().toISOString().slice(0, 10)}.csv`,
      });
    }
  }, [title]);

  const displayRows = Array.isArray(rowData) ? rowData : [];

  if (!mounted) {
    return (
      <div
        className="w-full flex items-center justify-center bg-cyber-panel border border-cyber-border rounded-lg text-slate-400"
        style={{ height }}
      >
        <div className="flex items-center space-x-3">
          <RefreshCw className="animate-spin text-cyber-accent" size={20} />
          <span>Initializing secure telemetry grid...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3 w-full">
      {/* Grid Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-cyber-dark/60 border border-cyber-border rounded-lg p-3">
        <div className="flex items-center space-x-3">
          {title && (
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Database size={16} className="text-cyber-accent" />
                {title}
              </h3>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          )}
          <span className="text-xs font-mono bg-cyber-surface px-2.5 py-1 rounded text-cyber-accent border border-cyber-border">
            {displayRows.length} records
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Filter */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search table..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="bg-cyber-surface text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded border border-cyber-border focus:border-cyber-accent focus:outline-none w-48 sm:w-64"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            title="Export CSV"
            className="flex items-center space-x-1 text-xs px-2.5 py-1.5 bg-cyber-surface hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-cyber-border transition-colors"
          >
            <Download size={14} />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh Data"
              className="flex items-center space-x-1 text-xs px-2.5 py-1.5 bg-cyber-surface hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-cyber-border transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-cyber-accent" : ""} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          )}

          {actions}
        </div>
      </div>

      {/* Grid Container */}
      <div
        className="w-full ag-theme-alpine-dark relative rounded-lg overflow-hidden border border-cyber-border shadow-2xl"
        style={{ height }}
      >
        {loading && (
          <div className="absolute inset-0 bg-cyber-dark/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-slate-300 space-y-3">
            <RefreshCw className="animate-spin text-cyber-accent" size={32} />
            <span className="text-sm font-medium">Querying endpoint telemetry...</span>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 bg-cyber-dark/95 z-10 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle size={40} className="text-amber-500 mb-2" />
            <h4 className="text-slate-100 font-semibold mb-1">Telemetry Collection Alert</h4>
            <p className="text-slate-400 text-xs max-w-md mb-4">{error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="text-xs px-4 py-2 bg-cyber-accent/20 hover:bg-cyber-accent/30 text-cyber-accent border border-cyber-accent/40 rounded transition-colors"
              >
                Retry Query
              </button>
            )}
          </div>
        )}

        {!loading && !error && displayRows.length === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Database size={32} className="opacity-40" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        )}

        <AgGridReact<T>
          ref={gridRef}
          theme="legacy"
          rowData={displayRows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          pagination={true}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={[25, 50, 100, 250]}
          rowSelection={{ mode: "singleRow" }}
        />
      </div>
    </div>
  );
}
