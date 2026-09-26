import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/layouts/Sidebar";

// Global AG Grid CSS styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export const metadata: Metadata = {
  title: "VantEndpoint | Endpoint Investigation & EDR Platform",
  description: "Enterprise Endpoint Detection & Response, Sysmon Monitoring, and Threat Investigation Platform.",
  icons: {
    icon: "/vanticon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cyber-dark text-slate-200 min-h-screen flex antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64 min-h-screen border-l border-cyber-border bg-cyber-panel">
          <main className="flex-grow p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}