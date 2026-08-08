"use client";

import React from "react";
import { RefreshCw, Upload, Download, Printer } from "lucide-react";

interface HeaderProps {
  onReset: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onPrint: () => void;
}

export function Header({ onReset, onImport, onExport, onPrint }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="logo">
        <div className="logo-icon">R</div>
        <h1>Resume Compiler</h1>
      </div>
      <div className="header-actions">
        <button onClick={onReset} className="header-btn" title="Reset to Sample Template" aria-label="Reset to Sample Template">
          <RefreshCw size={14} /> Reset
        </button>
        <label className="header-btn" htmlFor="import-markdown" style={{ cursor: "pointer" }} title="Import Markdown file" aria-label="Import Markdown file">
          <Upload size={14} /> Import
          <input
            id="import-markdown"
            type="file"
            accept=".md"
            onChange={onImport}
            className="visually-hidden"
            aria-label="Upload Markdown file"
          />
        </label>
        <button onClick={onExport} className="header-btn" title="Export Markdown file" aria-label="Export Markdown file">
          <Download size={14} /> Export
        </button>
        <button onClick={onPrint} className="btn-print" title="Print or Save as PDF" aria-label="Print or Save as PDF">
          <Printer size={15} /> Print / Save PDF
        </button>
      </div>
    </header>
  );
}
