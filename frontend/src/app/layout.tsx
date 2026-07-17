import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/layouts/Sidebar";



// 1. IMPORT AG GRID UTILITIES AND STYLES GLOBALLY
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// 2. REGISTER THE FEATURING ENGINE ONCE FOR EVERY PAGE
ModuleRegistry.registerModules([AllCommunityModule]);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VantEndpoint | Endpoint Investigation",
  description: "Enterprise Endpoint Investigation, System Monitoring, and Security Analysis Platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-cyber-dark text-slate-200 min-h-screen flex`}>
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