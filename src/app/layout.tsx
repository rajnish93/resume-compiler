import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://resume.rajnish.app/"),
  title: "Resume Compiler - Interactive Markdown Resume Builder",
  description:
    "An interactive real-time Markdown resume builder and compiler. Choose beautiful themes, customize margins, adjust document scale, and download print-ready PDFs.",
  keywords: [
    "resume builder",
    "markdown resume",
    "resume compiler",
    "pdf generator",
    "cv builder",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Resume Compiler - Interactive Markdown Resume Builder",
    description:
      "An interactive real-time Markdown resume builder and compiler. Choose beautiful themes, customize margins, adjust document scale, and download print-ready PDFs.",
    url: "https://resume.rajnish.app/",
    siteName: "Resume Compiler",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Compiler - Interactive Markdown Resume Builder",
    description:
      "An interactive real-time Markdown resume builder and compiler. Choose beautiful themes, customize margins, adjust document scale, and download print-ready PDFs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
