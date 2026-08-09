import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ResumeState {
  markdown: string;
  customCss: string;
  theme: string;
  scale: number;
  autoScale: boolean;
  setMarkdown: (markdown: string) => void;
  setCustomCss: (customCss: string) => void;
  setTheme: (theme: string) => void;
  setScale: (scale: number) => void;
  setAutoScale: (autoScale: boolean) => void;
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
      setMarkdown: (markdown) => set({ markdown }),
      setCustomCss: (customCss) => set({ customCss }),
      setTheme: (theme) => set({ theme }),
      setScale: (scale) => set({ scale }),
      setAutoScale: (autoScale) => set({ autoScale }),
      resetStore: (defaultMarkdown = "") =>
        set({
          markdown: defaultMarkdown,
          customCss: "",
          theme: "modern",
          scale: 0.92,
          autoScale: true,
        }),
    }),
    {
      name: "resume-compiler-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
