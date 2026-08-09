import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DEFAULT_RESUME_MARKDOWN } from "@/lib/defaultResumeTemplate";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "resume.md");

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      return NextResponse.json({ markdown: fileContent });
    }
  } catch (error: unknown) {
    console.warn("Failed to read template file from disk, using bundled fallback:", error);
  }

  return NextResponse.json({ markdown: DEFAULT_RESUME_MARKDOWN });
}
