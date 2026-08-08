"use client";

import React from "react";
import { Sliders, X, Info } from "lucide-react";
import { THEMES } from "@/lib/themes";

interface SettingsPopoverProps {
  theme: string;
  setTheme: (theme: string) => void;
  customCss: string;
  setCustomCss: (css: string) => void;
  autoScale: boolean;
  setAutoScale: (auto: boolean) => void;
  scale: number;
  setScale: (scale: number) => void;
  pageCount: number;
  onClose: () => void;
  popoverRef: React.RefObject<HTMLDivElement | null>;
}

export function SettingsPopover({
  theme,
  setTheme,
  customCss,
  setCustomCss,
  autoScale,
  setAutoScale,
  scale,
  setScale,
  pageCount,
  onClose,
  popoverRef,
}: SettingsPopoverProps) {
  return (
    <div ref={popoverRef} className="settings-popover" role="dialog" aria-label="Page Settings">
      <div className="popover-header">
        <span className="popover-title">
          <Sliders size={14} style={{ color: "var(--accent-primary)" }} /> Page Settings
        </span>
        <button onClick={onClose} className="popover-close" aria-label="Close page settings">
          <X size={16} />
        </button>
      </div>
      <div className="setting-group">
        <label className="setting-label" htmlFor="document-theme-select">Document Theme</label>
        <select
          id="document-theme-select"
          aria-label="Document Theme"
          value={theme}
          onChange={(e) => {
            if (customCss && !window.confirm("Switching themes clears your custom CSS. Continue?")) {
              return;
            }
            setTheme(e.target.value);
            setCustomCss("");
          }}
          className="select-pill"
          style={{ width: "100%" }}
        >
          {Object.values(THEMES).map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div className="setting-group">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label htmlFor="autofit-toggle" className="setting-label">Auto-fit Content to 1 Page</label>
          <label className="toggle-switch">
            <input
              id="autofit-toggle"
              type="checkbox"
              checked={autoScale}
              onChange={(e) => setAutoScale(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
      <div className="setting-group">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <label className="setting-label" htmlFor="manual-scale">Manual Document Scale</label>
          <span style={{ fontSize: "8.5pt", fontWeight: 600, color: "var(--accent-primary)" }}>
            {Math.round(scale * 100)}%
          </span>
        </div>
        <input
          id="manual-scale"
          type="range"
          min="0.88"
          max="1.5"
          step="0.01"
          value={scale}
          disabled={autoScale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="setting-slider"
          style={{ opacity: autoScale ? 0.5 : 1, cursor: autoScale ? "not-allowed" : "pointer" }}
        />
        <span style={{ fontSize: "7.5pt", color: "var(--text-muted)" }}>
          {autoScale
            ? `Auto-fitting active (min scale 88%, ${pageCount} ${pageCount === 1 ? "page" : "pages"}).`
            : "Manually enlarge or shrink document font size."}
        </span>
      </div>
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 12, marginTop: 4 }}>
        <div style={{ display: "flex", gap: 8, color: "var(--text-muted)" }}>
          <Info size={14} style={{ flexShrink: 0, marginTop: 2, color: "#60a5fa" }} />
          <p style={{ fontSize: "8pt", lineHeight: 1.45 }}>
            <strong>PDF Tip:</strong> Click <strong>Print / Save PDF</strong> or press <strong>CMD+P</strong>, select <strong>&quot;Save as PDF&quot;</strong>, and turn on <em>Background graphics</em>.
          </p>
        </div>
      </div>
    </div>
  );
}
