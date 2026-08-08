"use client";

import React from "react";
import { FileText, Code } from "lucide-react";

interface EditorPanelProps {
  activeTab: "editor" | "css";
  setActiveTab: (tab: "editor" | "css") => void;
  markdown: string;
  setMarkdown: (val: string) => void;
  customCss: string;
  setCustomCss: (val: string) => void;
  lineCount: number;
  lineNumbers: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  lineNumbersRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}

export function EditorPanel({
  activeTab,
  setActiveTab,
  markdown,
  setMarkdown,
  customCss,
  setCustomCss,
  lineCount,
  lineNumbers,
  textareaRef,
  lineNumbersRef,
  onScroll,
}: EditorPanelProps) {
  return (
    <section className="editor-panel" aria-label="Editor Panel">
      <div className="toolbar">
        <div
          role="tablist"
          aria-label="Editor tabs"
          className="toolbar-group"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Home" || e.key === "End") {
              e.preventDefault();
              let targetTab: "editor" | "css" = activeTab;
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                targetTab = activeTab === "editor" ? "css" : "editor";
              } else if (e.key === "Home") {
                targetTab = "editor";
              } else if (e.key === "End") {
                targetTab = "css";
              }
              setActiveTab(targetTab);
              const btn = document.getElementById(`tab-${targetTab}`);
              btn?.focus();
            }
          }}
        >
          <button
            id="tab-editor"
            role="tab"
            aria-selected={activeTab === "editor"}
            aria-controls="panel-editor"
            tabIndex={activeTab === "editor" ? 0 : -1}
            onClick={() => setActiveTab("editor")}
            className={`toolbar-btn ${activeTab === "editor" ? "active" : ""}`}
          >
            <FileText size={14} /> Markdown Editor
          </button>
          <button
            id="tab-css"
            role="tab"
            aria-selected={activeTab === "css"}
            aria-controls="panel-css"
            tabIndex={activeTab === "css" ? 0 : -1}
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
        <div
          id="panel-editor"
          role="tabpanel"
          aria-labelledby="tab-editor"
          hidden={activeTab !== "editor"}
          style={{ display: activeTab === "editor" ? "flex" : "none", width: "100%", height: "100%" }}
        >
          <div ref={lineNumbersRef} className="line-numbers" aria-hidden="true">
            <pre>{lineNumbers}</pre>
          </div>
          <textarea
            id="markdown-editor"
            ref={textareaRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            onScroll={onScroll}
            className="markdown-textarea"
            spellCheck="false"
            aria-label="Markdown content editor"
            placeholder="Write your resume markdown here..."
          />
        </div>

        <div
          id="panel-css"
          role="tabpanel"
          aria-labelledby="tab-css"
          hidden={activeTab !== "css"}
          style={{ display: activeTab === "css" ? "block" : "none", width: "100%", height: "100%" }}
        >
          <textarea
            id="css-editor"
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
            className="markdown-textarea"
            style={{ paddingLeft: 20 }}
            spellCheck="false"
            aria-label="Custom CSS editor"
            placeholder="/* Write custom CSS overrides here... Leave empty to use theme styles */"
          />
        </div>
      </div>
    </section>
  );
}
