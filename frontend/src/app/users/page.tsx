"use client";

import React, { useEffect, useState, useMemo } from "react";
import CyberDataGrid from "@/components/CyberDataGrid";
import { InvestigationService, UserItem } from "@/services/api";
import { ColDef } from "ag-grid-community";
import { Users, UserCheck, Shield } from "lucide-react";

export default function UsersPage() {
  const [rowData, setRowData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    InvestigationService.getUsers()
      .then((data) => {
        setRowData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError(err.message || "Failed to load active user sessions.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columnDefs = useMemo<ColDef<UserItem>[]>(
    () => [
      {
        field: "name",
        headerName: "User / Account",
        flex: 1,
        cellRenderer: (params: any) => (
          <div className="flex items-center space-x-2 py-1">
            <UserCheck size={14} className="text-cyan-400" />
            <span className="font-semibold text-xs text-slate-100">{params.value}</span>
          </div>
        ),
      },
      {
        field: "terminal",
        headerName: "Terminal / Session Type",
        flex: 1,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-300">{params.value || "Console"}</span>
        ),
      },
      {
        field: "host",
        headerName: "Logon Host / IP",
        flex: 1,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-400">{params.value || "127.0.0.1"}</span>
        ),
      },
      {
        field: "pid",
        headerName: "Session Broker PID",
        width: 140,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-cyan-400 font-semibold">{params.value || "-"}</span>
        ),
      },
      {
        field: "started",
        headerName: "Logon Status",
        flex: 1,
        cellRenderer: (params: any) => (
          <span className="text-xs text-emerald-400 font-mono">
            {typeof params.value === "number" ? new Date(params.value * 1000).toLocaleString() : params.value || "Active"}
          </span>
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
            <Users className="text-cyber-accent" size={24} />
            User Sessions & Account Audit
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Active interactive console sessions, remote desktop logons, and account privileges.
          </p>
        </div>
      </div>

      <CyberDataGrid<UserItem>
        title="Logged In Users & Active Sessions"
        subtitle="Host sessions and security context"
        rowData={rowData}
        columnDefs={columnDefs}
        loading={loading}
        error={error}
        onRefresh={fetchUsers}
        height="calc(100vh - 220px)"
      />
    </div>
  );
}