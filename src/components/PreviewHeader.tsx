"use client";

import React from "react";
import { Maximize2, Sliders } from "lucide-react";

interface PreviewHeaderProps {
  pageCount: number;
  scale: number;
  zoom: number;
  setZoom: (zoom: number) => void;
  onResetZoom: () => void;
  showSettingsPopover: boolean;
  setShowSettingsPopover: (show: boolean) => void;
  popoverButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export function PreviewHeader({
  pageCount,
  scale,
  zoom,
  setZoom,
  onResetZoom,
  showSettingsPopover,
  setShowSettingsPopover,
  popoverButtonRef,
}: PreviewHeaderProps) {
  return (
    <div className="preview-header">
      <div className="preview-status">
        <span className="status-dot"></span>
        <span>Live Preview ({pageCount} {pageCount === 1 ? "Page" : "Pages"})</span>
      </div>
      <div className="control-pill-group">
        {/* Scale Indicator / Slider Pill */}
        <div className="control-item">
          <span className="control-label">Scale:</span>
          <span style={{ fontWeight: 600, color: "var(--accent-primary)", fontSize: "8.5pt", minWidth: 32 }}>
            {Math.round(scale * 100)}%
          </span>
        </div>
        {/* Zoom Controls */}
        <div className="control-item" style={{ gap: 6 }}>
          <span className="control-label" id="zoom-label">Zoom:</span>
          <input
            type="range"
            aria-labelledby="zoom-label"
            aria-label="Preview zoom slider"
            min="0.4"
            max="1.2"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="setting-slider"
            style={{ width: 65 }}
          />
          <span style={{ fontSize: "8pt", color: "var(--text-secondary)", minWidth: 32 }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={onResetZoom}
            className="toolbar-btn"
            style={{ fontSize: "8pt", padding: "2px 6px" }}
            title="Fit zoom perfectly to window"
            aria-label="Fit zoom to window"
          >
            <Maximize2 size={11} /> Fit
          </button>
        </div>
        {/* Popover Settings Toggle Button */}
        <button
          ref={popoverButtonRef}
          type="button"
          aria-expanded={showSettingsPopover}
          aria-haspopup="dialog"
          aria-label="Open page settings"
          onClick={() => setShowSettingsPopover(!showSettingsPopover)}
          className={`toolbar-btn ${showSettingsPopover ? "active" : ""}`}
          style={{ padding: "4px 8px" }}
          title="Open Advanced Page Settings & Tips"
        >
          <Sliders size={13} />
        </button>
      </div>
    </div>
  );
}
