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
  Code
} from "lucide-react";
import { parseMarkdown } from "@/lib/parser";
import { THEMES } from "@/lib/themes";



export default function ResumeBuilder() {
  const [markdown, setMarkdown] = useState<string>("");
  const [customCss, setCustomCss] = useState<string>("");
  const [theme, setTheme] = useState<string>("modern");
  const [scale, setScale] = useState<number>(0.92);
  const [autoScale, setAutoScale] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const margin = "0.4in";
  const paperFormat = "a4";
  const [activeTab, setActiveTab] = useState<"editor" | "css">("editor");
  const [zoom, setZoom] = useState<number>(0.75);
  const [mounted, setMounted] = useState<boolean>(false);
  const [paperHeight, setPaperHeight] = useState<number>(1123);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);

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
    const savedMarkdown = localStorage.getItem("resume_markdown");
    if (savedMarkdown) {
      setMarkdown(savedMarkdown);
    } else {
      fetch("/api/template")
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch template");
        })
        .then((data) => {
          if (data.markdown) setMarkdown(data.markdown);
        })
        .catch((err) => console.error("Failed to load template from data/resume.md:", err));
    }

    setCustomCss(localStorage.getItem("resume_custom_css") || "");
    setTheme(localStorage.getItem("resume_theme") || "modern");
    setScale(Number(localStorage.getItem("resume_scale")) || 0.92);
    setAutoScale(localStorage.getItem("resume_autoscale") !== "false");
    setMounted(true);
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
                background-color: #ffffff;
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

    // Perform height measurement & auto-scaling
    const runMeasurement = () => {
      if (containerEl) {
        // Temporarily reset zoom to measure unscaled natural height
        if (bodyEl) bodyEl.style.zoom = "1";
        const contentHeight = containerEl.scrollHeight;

        const totalHeight = paperFormat === "a4" ? 1123 : 1056;
        if (contentHeight > 0) {
          const calculatedScale = totalHeight / contentHeight;
          const finalScale = Math.min(1.0, Math.max(0.4, Number(calculatedScale.toFixed(2))));

          if (autoScale) {
            if (scale !== finalScale) {
              setScale(finalScale);
            }
            if (bodyEl) bodyEl.style.zoom = finalScale.toString();
          } else {
            if (bodyEl) bodyEl.style.zoom = scale.toString();
          }

          const activeScale = autoScale ? finalScale : scale;
          const visualContentHeight = Math.ceil(contentHeight * activeScale);
          const newPaperHeight = Math.max(totalHeight, visualContentHeight);
          setPaperHeight(newPaperHeight);
        }
      }
    };

    const timeoutId = setTimeout(runMeasurement, 50);
    return () => clearTimeout(timeoutId);
  }, [htmlContent, activeThemeCss, mounted, autoScale, paperFormat, scale]);

  // Vector Print / Save PDF Handler (Real selectable text, links, ATS-friendly)
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
    return <div style={{ background: "#0f172a", height: "100vh" }} />;
  }

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">R</div>
          <h1>Resume Compiler</h1>
          <span>Next.js App</span>
        </div>
        <div className="header-actions">
          <button onClick={handleReset} className="toolbar-btn" title="Reset to Sample">
            <RefreshCw size={14} /> Reset
          </button>
          <button onClick={handlePrint} className="btn-print" title="Print or Save as PDF via system dialog">
            <Printer size={16} /> Print / Save PDF
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
            {activeTab === "editor" && (
              <div className="toolbar-group">
                <label className="toolbar-btn" style={{ cursor: "pointer" }}>
                  <Upload size={14} style={{ marginRight: 6 }} /> Import
                  <input
                    type="file"
                    accept=".md"
                    onChange={handleImportMarkdown}
                    style={{ display: "none" }}
                  />
                </label>
                <button onClick={handleExportMarkdown} className="toolbar-btn">
                  <Download size={14} /> Export .md
                </button>
              </div>
            )}
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
          <div className="preview-header">
            <div className="preview-status">
              <span className="status-dot"></span>
              <span>Live Preview Synced</span>
            </div>
            <div className="toolbar-group">
              <span className="setting-label" style={{ fontSize: "8.5pt" }}>Workspace Zoom:</span>
              <input
                type="range"
                min="0.5"
                max="1.2"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="setting-slider"
                style={{ width: 80 }}
              />
              <span style={{ fontSize: "8.5pt", color: "var(--text-secondary)", width: 35 }}>
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={handleResetZoom}
                className="toolbar-btn"
                style={{ fontSize: "8pt", padding: "3px 8px" }}
                title="Reset zoom to fit view perfectly"
              >
                Reset to Fit
              </button>
            </div>
          </div>

          <div className="preview-viewport" ref={previewViewportRef}>
            <div
              className="paper-wrapper"
              style={{
                width: (paperFormat === "a4" ? 794 : 816) * zoom,
                height: paperHeight * zoom,
              }}
            >
              <div
                className={`paper-frame format-${paperFormat}`}
                style={{
                  width: paperFormat === "a4" ? 794 : 816,
                  height: paperHeight,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                }}
              >
                <iframe
                  id="preview-iframe"
                  ref={iframeRef}
                  title="Resume Print Preview"
                  className="resume-iframe"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar Settings Panel */}
        <aside className="settings-sidebar">
          <h2 className="sidebar-title">
            <Sliders size={14} style={{ marginRight: 6, display: "inline" }} />
            Page Settings
          </h2>

          <div className="setting-group">
            <label className="setting-label">Theme</label>
            <select
              id="theme-select"
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value);
                setCustomCss("");
              }}
              className="setting-select"
            >
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="setting-group" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="autoscale-checkbox"
              checked={autoScale}
              onChange={(e) => setAutoScale(e.target.checked)}
              style={{ cursor: "pointer", width: 16, height: 16, accentColor: "var(--accent-primary)" }}
            />
            <label htmlFor="autoscale-checkbox" className="setting-label" style={{ cursor: "pointer" }}>
              Auto-fit to 1 Page
            </label>
          </div>

          <div className="setting-group">
            <div className="slider-container">
              <div className="slider-header">
                <span className="setting-label">Document Scale</span>
                <span className="slider-value">{Math.round(scale * 100)}%</span>
              </div>
              <input
                id="scale-slider"
                type="range"
                min="0.4"
                max="1.5"
                step="0.01"
                value={scale}
                disabled={autoScale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="setting-slider"
                style={{ opacity: autoScale ? 0.5 : 1, cursor: autoScale ? "not-allowed" : "pointer" }}
              />
              <span style={{ fontSize: "7.5pt", color: "var(--text-muted)", marginTop: 2 }}>
                {autoScale ? "Scale is managed automatically to fit A4 size." : "Shrink or enlarge text manually."}
              </span>
            </div>
          </div>

          {/* Margins and Format are hardcoded to standard A4 (margin: 0.4in) */}

          <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "var(--text-muted)" }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: "8pt", lineHeight: 1.4 }}>
                Tips: Use <strong>CMD+P</strong> or click <strong>Print</strong> and select <strong>&quot;Save as PDF&quot;</strong>. Set backgrounds to print. Turn off headers/footers in the print dialog.
              </p>
            </div>
          </div>
        </aside>
      </main>

      {/* Off-screen Printable & Export Container */}
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

