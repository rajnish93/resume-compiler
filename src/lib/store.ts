import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ResumeState {
  markdown: string;
  customCss: string;
  theme: string;
  scale: number;
  autoScale: boolean;
  zoom: number;
  setMarkdown: (markdown: string) => void;
  setCustomCss: (customCss: string) => void;
  setTheme: (theme: string) => void;
  setScale: (scale: number) => void;
  setAutoScale: (autoScale: boolean) => void;
  setZoom: (zoom: number) => void;
  resetStore: (defaultMarkdown?: string) => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      markdown: "",
      customCss: "",
      theme: "modern",
      scale: 0.92,
      autoScale: true,
      zoom: 0.75,
      setMarkdown: (markdown) => set({ markdown }),
      setCustomCss: (customCss) => set({ customCss }),
      setTheme: (theme) => set({ theme }),
      setScale: (scale) => set({ scale }),
      setAutoScale: (autoScale) => set({ autoScale }),
      setZoom: (zoom) => set({ zoom }),
      resetStore: (defaultMarkdown = "") =>
        set({
          markdown: defaultMarkdown,
          customCss: "",
          theme: "modern",
          scale: 0.92,
          autoScale: true,
          zoom: 0.75,
        }),
    }),
    {
      name: "resume-compiler-storage",
    }
  )
);
