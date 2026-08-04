"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Printer,
  RefreshCw,
  Sliders,
  Download,
  Upload,
  Info,
  Code,
  Maximize2,
  X
} from "lucide-react";
import { parseMarkdown } from "@/lib/parser";
import { THEMES } from "@/lib/themes";

export default function ResumeBuilder() {
  const [markdown, setMarkdown] = useState<string>("");
  const [customCss, setCustomCss] = useState<string>("");
  const [theme, setTheme] = useState<string>("modern");
  const [scale, setScale] = useState<number>(0.92);
  const [autoScale, setAutoScale] = useState<boolean>(true);
  const margin = "0.4in";
  const paperFormat = "a4";
  const [activeTab, setActiveTab] = useState<"editor" | "css">("editor");
  const [zoom, setZoom] = useState<number>(0.75);
  const [mounted, setMounted] = useState<boolean>(false);
  const [pageCount, setPageCount] = useState<number>(1);
  const [showSettingsPopover, setShowSettingsPopover] = useState<boolean>(false);

  const pageHeight = paperFormat === "a4" ? 1123 : 1056;
  const pageWidth = paperFormat === "a4" ? 794 : 816;
  const documentHeight = pageCount * pageHeight;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverButtonRef = useRef<HTMLButtonElement>(null);

  // Close popover when clicking outside or pressing Escape key
  useEffect(() => {
    if (!showSettingsPopover) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        popoverButtonRef.current &&
        !popoverButtonRef.current.contains(target)
      ) {
        setShowSettingsPopover(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSettingsPopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    const iframeDoc = iframeRef.current?.contentDocument;
    if (iframeDoc) {
      iframeDoc.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      if (iframeDoc) {
        iframeDoc.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [showSettingsPopover]);

  // Dynamic zoom calculation to fit preview viewport perfectly
  const handleResetZoom = () => {
    if (previewViewportRef.current) {
      const availableWidth = previewViewportRef.current.clientWidth - 48; // 24px padding left & right
      const targetPaperWidth = paperFormat === "a4" ? 794 : 816;
      if (availableWidth > 0) {
        const fitScale = Math.min(1.0, Math.max(0.4, Number((availableWidth / targetPaperWidth).toFixed(2))));
        setZoom(fitScale);
        return;
      }
    }
    setZoom(0.75);
  };

  // Initialize state on mount: check localStorage or fetch data/resume.md from /api/template
  useEffect(() => {
    const loadInitialData = async () => {
      const savedMarkdown = localStorage.getItem("resume_markdown");
      if (savedMarkdown) {
        setMarkdown(savedMarkdown);
      } else {
        try {
          const res = await fetch("/api/template");
          if (res.ok) {
            const data = await res.json();
            if (data.markdown) setMarkdown(data.markdown);
          }
        } catch (err) {
          console.error("Failed to load template from data/resume.md:", err);
        }
      }

      setCustomCss(localStorage.getItem("resume_custom_css") || "");
      setTheme(localStorage.getItem("resume_theme") || "modern");
      setScale(Number(localStorage.getItem("resume_scale")) || 0.92);
      setAutoScale(localStorage.getItem("resume_autoscale") !== "false");
      setMounted(true);
    };

    loadInitialData();
  }, []);

  // Persist session edits to localStorage
  useEffect(() => {
    if (mounted && markdown) {
      localStorage.setItem("resume_markdown", markdown);
    }
  }, [markdown, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem("resume_custom_css", customCss);
  }, [customCss, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem("resume_theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem("resume_scale", scale.toString());
  }, [scale, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem("resume_autoscale", autoScale.toString());
  }, [autoScale, mounted]);

  // Handle scroll syncing
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Pre-render content
  const htmlContent = parseMarkdown(markdown);
  const activeThemeCss = customCss ? customCss : THEMES[theme]?.css || THEMES["modern"].css;

  // In-place iframe synchronization effect (zero flicker, no document re-creation)
  useEffect(() => {
    if (!mounted || !iframeRef.current) return;
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // Check if initial iframe structure exists
    let themeStyleEl = doc.getElementById("theme-style") as HTMLStyleElement | null;
    let containerEl = doc.getElementById("resume-container") as HTMLElement | null;

    if (!themeStyleEl || !containerEl) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style id="theme-style"></style>
            <style id="base-style">
              @page {
                size: ${paperFormat === "a4" ? "A4" : "letter"};
                margin: ${margin};
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                background-color: transparent;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                width: 100% !important;
              }
              body {
                padding: ${margin} !important;
              }
              .container {
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                box-sizing: border-box !important;
              }
              @media print {
                @page {
                  size: ${paperFormat === "a4" ? "A4" : "letter"};
                  margin: ${margin};
                }
                html, body {
                  padding: 0 !important;
                  margin: 0 !important;
                  background: white !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body {
                  padding: 0 !important;
                }
                .container {
                  padding: 0 !important;
                  margin: 0 !important;
                  width: 100% !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="container" id="resume-container"></div>
          </body>
        </html>
      `);
      doc.close();
      themeStyleEl = doc.getElementById("theme-style") as HTMLStyleElement;
      containerEl = doc.getElementById("resume-container") as HTMLElement;
    }

    // In-place update theme CSS and HTML content without document reloads
    if (themeStyleEl && themeStyleEl.textContent !== activeThemeCss) {
      themeStyleEl.textContent = activeThemeCss;
    }

    if (containerEl && containerEl.innerHTML !== htmlContent) {
      containerEl.innerHTML = htmlContent;
    }

    // Apply scaling in-place to body
    const bodyEl = doc.body;
    if (bodyEl) {
      bodyEl.style.zoom = scale.toString();
    }

    // Perform height measurement & auto-scaling & pagination calculation
    const runMeasurement = () => {
      if (!containerEl || !doc.body) return;

      // Temporarily set zoom to 1 to measure unscaled natural content height
      doc.body.style.zoom = "1";
      const naturalHeight = containerEl.scrollHeight;
      if (naturalHeight <= 0) return;

      const MIN_SCALE = .88;
      let appliedScale = scale;
      let requiredPageCount = 1;

      if (autoScale) {
        if (naturalHeight <= pageHeight) {
          appliedScale = 1.0;
          requiredPageCount = 1;
        } else {
          const rawFitScale = pageHeight / naturalHeight;
          if (rawFitScale >= MIN_SCALE) {
            appliedScale = Number(rawFitScale.toFixed(2));
            requiredPageCount = 1;
          } else {
            appliedScale = MIN_SCALE;
            const scaledHeight = naturalHeight * appliedScale;
            requiredPageCount = Math.max(1, Math.ceil(scaledHeight / pageHeight));
          }
        }
      } else {
        appliedScale = Math.max(MIN_SCALE, scale);
        const scaledHeight = naturalHeight * appliedScale;
        requiredPageCount = Math.max(1, Math.ceil(scaledHeight / pageHeight));
      }

      // Apply zoom to iframe body
      doc.body.style.zoom = appliedScale.toString();

      // Update state only if values have actually changed to avoid infinite re-renders
      if (autoScale && Math.abs(scale - appliedScale) >= 0.005) {
        setScale(appliedScale);
      }
      if (pageCount !== requiredPageCount) {
        setPageCount(requiredPageCount);
      }
    };

    const timeoutId = setTimeout(runMeasurement, 50);
    return () => clearTimeout(timeoutId);
  }, [htmlContent, activeThemeCss, mounted, autoScale, paperFormat, scale, pageCount, pageHeight]);

  // Vector Print / Save PDF Handler
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.focus();
          iframeRef.current.contentWindow.print();
          return;
        }
      } catch (e) {
        console.warn("Could not print iframe directly, falling back to main window print:", e);
      }
      window.print();
    }
  };

  // Reset settings by fetching master content directly from data/resume.md
  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset to the original resume template? Any unsaved edits will be lost.")) {
      try {
        const response = await fetch("/api/template");
        if (response.ok) {
          const data = await response.json();
          if (data.markdown) {
            setMarkdown(data.markdown);
          }
        }
      } catch (err) {
        console.error("Failed to reset template file from data/resume.md:", err);
      }
      localStorage.removeItem("resume_markdown");
      localStorage.removeItem("resume_custom_css");
      localStorage.removeItem("resume_theme");
      localStorage.removeItem("resume_scale");
      localStorage.removeItem("resume_autoscale");
      setCustomCss("");
      setTheme("modern");
      setScale(0.92);
      setAutoScale(true);
      setPageCount(1);
    }
  };

  // Download raw markdown file
  const handleExportMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload markdown file
  const handleImportMarkdown = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          setMarkdown(text);
        }
      };
      reader.readAsText(file);
    }
  };

  // Line count generation
  const lineCount = markdown.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join("\n");

  if (!mounted) {
    return <div style={{ background: "#090d16", height: "100vh" }} />;
  }

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">R</div>
          <h1>Resume Compiler</h1>
        </div>
        <div className="header-actions">
          <button onClick={handleReset} className="header-btn" title="Reset to Sample Template">
            <RefreshCw size={14} /> Reset
          </button>
          <label className="header-btn" style={{ cursor: "pointer" }} title="Import Markdown file">
            <Upload size={14} /> Import
            <input
              type="file"
              accept=".md"
              onChange={handleImportMarkdown}
              style={{ display: "none" }}
            />
          </label>
          <button onClick={handleExportMarkdown} className="header-btn" title="Export Markdown file">
            <Download size={14} /> Export
          </button>
          <button onClick={handlePrint} className="btn-print" title="Print or Save as PDF">
            <Printer size={15} /> Print / Save PDF
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="workspace">
        {/* Editor Panel */}
        <section className="editor-panel">
          <div className="toolbar">
            <div className="toolbar-group">
              <button
                onClick={() => setActiveTab("editor")}
                className={`toolbar-btn ${activeTab === "editor" ? "active" : ""}`}
              >
                <FileText size={14} /> Markdown Editor
              </button>
              <button
                onClick={() => setActiveTab("css")}
                className={`toolbar-btn ${activeTab === "css" ? "active" : ""}`}
              >
                <Code size={14} /> Custom CSS
              </button>
            </div>
            <div className="toolbar-group" style={{ fontSize: "8pt", color: "var(--text-muted)" }}>
              <span>{lineCount} lines</span>
            </div>
          </div>

          <div className="editor-wrapper">
            {activeTab === "editor" ? (
              <>
                <div ref={lineNumbersRef} className="line-numbers">
                  <pre>{lineNumbers}</pre>
                </div>
                <textarea
                  id="markdown-editor"
                  ref={textareaRef}
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  onScroll={handleScroll}
                  className="markdown-textarea"
                  spellCheck="false"
                  placeholder="Write your resume markdown here..."
                />
              </>
            ) : (
              <textarea
                id="css-editor"
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                className="markdown-textarea"
                style={{ paddingLeft: 20 }}
                spellCheck="false"
                placeholder="/* Write custom CSS overrides here... Leave empty to use theme styles */"
              />
            )}
          </div>
        </section>

        {/* Live Preview Panel */}
        <section className="preview-panel">
          {/* Integrated Control Header in Preview */}
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
                <span className="control-label">Zoom:</span>
                <input
                  type="range"
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
                  onClick={handleResetZoom}
                  className="toolbar-btn"
                  style={{ fontSize: "8pt", padding: "2px 6px" }}
                  title="Fit zoom perfectly to window"
                >
                  <Maximize2 size={11} /> Fit
                </button>
              </div>
              {/* Popover Settings Toggle Button */}
              <button
                ref={popoverButtonRef}
                type="button"
                onClick={() => setShowSettingsPopover(!showSettingsPopover)}
                className={`toolbar-btn ${showSettingsPopover ? "active" : ""}`}
                style={{ padding: "4px 8px" }}
                title="Open Advanced Page Settings & Tips"
              >
                <Sliders size={13} />
              </button>
            </div>
          </div>
          {/* Floating Settings Popover Card */}
          {showSettingsPopover && (
            <div ref={popoverRef} className="settings-popover">
              <div className="popover-header">
                <span className="popover-title">
                  <Sliders size={14} style={{ color: "var(--accent-primary)" }} /> Page Settings
                </span>
                <button onClick={() => setShowSettingsPopover(false)} className="popover-close">
                  <X size={16} />
                </button>
              </div>
              <div className="setting-group">
                <label className="setting-label">Document Theme</label>
                <select
                  value={theme}
                  onChange={(e) => {
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
                  <label className="setting-label">Auto-fit Content to 1 Page</label>
                  <label className="toggle-switch">
                    <input
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
                  <label className="setting-label">Manual Document Scale</label>
                  <span style={{ fontSize: "8.5pt", fontWeight: 600, color: "var(--accent-primary)" }}>
                    {Math.round(scale * 100)}%
                  </span>
                </div>
                <input
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
          )}
          {/* Viewport Canvas for A4 Sheets */}
          <div className="preview-viewport" ref={previewViewportRef}>
            <div
              className="paper-wrapper"
              style={{
                width: pageWidth * zoom,
                height: documentHeight * zoom,
              }}
            >
              <div
                className={`paper-frame format-${paperFormat}`}
                style={{
                  width: pageWidth,
                  height: documentHeight,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  position: "relative",
                  background: "transparent",
                  boxShadow: "none",
                  border: "none",
                }}
              >
                {/* Background sheet containers */}
                <div
                  className="page-backgrounds-container"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                >
                  {Array.from({ length: pageCount }).map((_, index) => (
                    <div
                      key={index}
                      className="page-sheet"
                      style={{
                        width: pageWidth,
                        height: pageHeight,
                        position: "absolute",
                        top: index * pageHeight,
                        left: 0,
                        backgroundColor: "#ffffff",
                        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                        borderBottom: index < pageCount - 1 ? "2px dashed #94a3b8" : "none",
                        boxSizing: "border-box",
                      }}
                    >
                      {pageCount > 1 && (
                        <div
                          className="page-number-badge"
                          style={{
                            position: "absolute",
                            bottom: 12,
                            right: 16,
                            fontSize: "8pt",
                            fontWeight: 600,
                            color: "#94a3b8",
                            userSelect: "none",
                          }}
                        >
                          Page {index + 1} of {pageCount}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <iframe
                  id="preview-iframe"
                  ref={iframeRef}
                  title="Resume Print Preview"
                  className="resume-iframe"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    height: "100%",
                    border: "none",
                    background: "transparent",
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Off-screen Printable Area */}
      <div id="resume-print-area">
        <style dangerouslySetInnerHTML={{ __html: activeThemeCss }} />
        <div
          className="container"
          style={{
            zoom: scale,
            width: "100%",
            padding: 0,
            margin: 0,
            boxSizing: "border-box",
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}
