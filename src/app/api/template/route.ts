import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "resume.md");

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      return NextResponse.json({ markdown: fileContent });
    } else {
      console.warn(`Template file not found at: ${filePath}`);
      return NextResponse.json({ error: "Template file not found" }, { status: 404 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to read template";
    console.error("Failed to read template file:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
