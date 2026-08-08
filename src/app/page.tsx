"use client";

import React, { useState, useEffect, useRef } from "react";
import { parseMarkdown, sanitizeCss } from "@/lib/parser";
import { THEMES } from "@/lib/themes";
import { Header } from "@/components/Header";
import { EditorPanel } from "@/components/EditorPanel";
import { PreviewHeader } from "@/components/PreviewHeader";
import { SettingsPopover } from "@/components/SettingsPopover";

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

  const pageHeight = 1123;
  const pageWidth = 794;
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

    let iframeDoc: Document | null = null;
    try {
      iframeDoc = iframeRef.current?.contentDocument || null;
      if (iframeDoc) {
        iframeDoc.addEventListener("mousedown", handleClickOutside);
      }
    } catch {
      // Ignore cross-origin access errors
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      try {
        if (iframeDoc) {
          iframeDoc.removeEventListener("mousedown", handleClickOutside);
        }
      } catch {
        // Ignore cross-origin access errors
      }
    };
  }, [showSettingsPopover]);

  // Dynamic zoom calculation to fit preview viewport perfectly
  const handleResetZoom = () => {
    if (previewViewportRef.current) {
      const availableWidth = previewViewportRef.current.clientWidth - 48; // 24px padding left & right
      const targetPaperWidth = 794;
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
      if (savedMarkdown !== null) {
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
    if (mounted) {
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
  const baseThemeCss = THEMES[theme]?.css || THEMES["modern"].css;
  const activeThemeCss = `${sanitizeCss(baseThemeCss)}\n${sanitizeCss(customCss)}`;

  // In-place iframe synchronization effect (zero flicker, no document re-creation)
  useEffect(() => {
    if (!mounted || !iframeRef.current) return;
    const iframe = iframeRef.current;
    let doc: Document | null = null;
    try {
      doc = iframe.contentDocument || iframe.contentWindow?.document || null;
    } catch {
      // If navigated cross-origin, reset iframe src back to local about:blank
      iframe.src = "about:blank";
      return;
    }
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
            <base target="_blank">
            <style id="theme-style"></style>
            <style id="base-style">
              @page {
                size: a4 portrait;
                margin: ${margin};
              }
              *, *::before, *::after {
                box-sizing: border-box !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                background-color: transparent;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                width: 100% !important;
                max-width: 100% !important;
                overflow-x: hidden !important;
              }
              body {
                padding: ${margin} !important;
                word-wrap: break-word !important;
                overflow-wrap: anywhere !important;
                word-break: break-word !important;
              }
              .container {
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                box-sizing: border-box !important;
                word-wrap: break-word !important;
                overflow-wrap: anywhere !important;
                word-break: break-word !important;
              }
              .container * {
                max-width: 100% !important;
                box-sizing: border-box !important;
              }
              p, h1, h2, h3, h4, h5, h6, li, a, span, div, td, th {
                overflow-wrap: anywhere !important;
                word-wrap: break-word !important;
                word-break: break-word !important;
              }
              pre, code {
                white-space: pre-wrap !important;
                word-wrap: break-word !important;
                overflow-wrap: anywhere !important;
                word-break: break-word !important;
              }
              table {
                width: 100% !important;
                max-width: 100% !important;
                table-layout: fixed !important;
              }
              img, svg, canvas, iframe, video {
                max-width: 100% !important;
                height: auto !important;
              }
              @media print {
                @page {
                  size: a4 portrait;
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
      const marginPx = margin.endsWith("in") ? parseFloat(margin) * 96 : 0;
      const printablePageHeight = pageHeight - marginPx * 2;
      let appliedScale = scale;
      let requiredPageCount = 1;

      if (autoScale) {
        if (naturalHeight <= printablePageHeight) {
          appliedScale = 1.0;
          requiredPageCount = 1;
        } else {
          const rawFitScale = printablePageHeight / naturalHeight;
          if (rawFitScale >= MIN_SCALE) {
            appliedScale = Number(rawFitScale.toFixed(2));
            requiredPageCount = 1;
          } else {
            appliedScale = MIN_SCALE;
            const scaledHeight = naturalHeight * appliedScale;
            requiredPageCount = Math.max(1, Math.ceil(scaledHeight / printablePageHeight));
          }
        }
      } else {
        appliedScale = Math.max(MIN_SCALE, scale);
        const scaledHeight = naturalHeight * appliedScale;
        requiredPageCount = Math.max(1, Math.ceil(scaledHeight / printablePageHeight));
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

    // Intercept hyperlink clicks in the preview iframe: anchor links (#) scroll smoothly in preview, external links open in new tab
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest("a");
      const rawHref = target?.getAttribute("href");
      if (!rawHref) return;

      if (rawHref.startsWith("#")) {
        e.preventDefault();
        const targetId = rawHref.slice(1);
        if (targetId) {
          let targetEl: Element | null = doc.getElementById(targetId);
          if (!targetEl) {
            try {
              targetEl = doc.querySelector(`[name="${CSS.escape(targetId)}"]`);
            } catch {
              targetEl = null;
            }
          }
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth" });
          }
        }
        return;
      }

      if (target && target.href) {
        e.preventDefault();
        window.open(target.href, "_blank", "noopener,noreferrer");
      }
    };
    doc.addEventListener("click", handleLinkClick);

    const timeoutId = setTimeout(runMeasurement, 50);
    return () => {
      clearTimeout(timeoutId);
      try {
        doc.removeEventListener("click", handleLinkClick);
      } catch {
        // Ignore cross-origin access errors
      }
    };
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

  // Intercept Cmd+P / Ctrl+P to trigger clean iframe print directly
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Reset settings by fetching master content directly from data/resume.md
  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset to the original resume template? Any unsaved edits will be lost.")) {
      try {
        const response = await fetch("/api/template");
        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.statusText}`);
        }
        const data = await response.json();
        if (typeof data.markdown !== "string" || !data.markdown) {
          throw new Error("Invalid markdown template received from server.");
        }
        setMarkdown(data.markdown);
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
      } catch (err) {
        console.error("Failed to reset template file from data/resume.md:", err);
        alert("Failed to reset template. Your current changes and settings have been preserved.");
      }
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
    URL.revokeObjectURL(url);
  };

  // Upload markdown file
  const handleImportMarkdown = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1_000_000) {
        window.alert("The file is larger than 1 MB. Please choose a smaller markdown file.");
        input.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          setMarkdown(text);
        }
        input.value = "";
      };
      reader.onerror = () => {
        console.error("Failed to read the markdown file:", reader.error);
        window.alert("Could not read the selected file.");
        input.value = "";
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
      <Header
        onReset={handleReset}
        onImport={handleImportMarkdown}
        onExport={handleExportMarkdown}
        onPrint={handlePrint}
      />

      {/* Main Workspace */}
      <main className="workspace">
        {/* Editor Panel */}
        <EditorPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          markdown={markdown}
          setMarkdown={setMarkdown}
          customCss={customCss}
          setCustomCss={setCustomCss}
          lineCount={lineCount}
          lineNumbers={lineNumbers}
          textareaRef={textareaRef}
          lineNumbersRef={lineNumbersRef}
          onScroll={handleScroll}
        />

        {/* Live Preview Panel */}
        <section className="preview-panel">
          <PreviewHeader
            pageCount={pageCount}
            scale={scale}
            zoom={zoom}
            setZoom={setZoom}
            onResetZoom={handleResetZoom}
            showSettingsPopover={showSettingsPopover}
            setShowSettingsPopover={setShowSettingsPopover}
            popoverButtonRef={popoverButtonRef}
          />
          {showSettingsPopover && (
            <SettingsPopover
              theme={theme}
              setTheme={setTheme}
              customCss={customCss}
              setCustomCss={setCustomCss}
              autoScale={autoScale}
              setAutoScale={setAutoScale}
              scale={scale}
              setScale={setScale}
              pageCount={pageCount}
              onClose={() => setShowSettingsPopover(false)}
              popoverRef={popoverRef}
            />
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
      <div id="resume-print-area" className={`format-${paperFormat}`}>
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
