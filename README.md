# 📄 Resume Compiler

A powerful, security-focused, markdown-driven resume compiler built with **Next.js 16**, **React 19**, and **TypeScript**. Write your resume in clean Markdown, customize styles with themes or custom CSS, preview real-time A4 page layouts, and export pixel-perfect PDFs.

---

## ✨ Features

- **📝 Live Markdown Editor**: Side-by-side split screen editor with line numbering and instant live preview.
- **🎨 Theme Engine & Custom CSS**: Select from preset themes (*Modern*, *Classic*, *Minimal*, *Elegant*, *Compact*) or fine-tune styling using custom CSS.
- **📄 Precise A4 Paper Formatting**: Standard **A4** paper layout with automatic page height calculations, multi-page page breaks, and scale adjustments.
- **🔒 Secure HTML & CSS Sanitization**: Integrated **DOMPurify** and custom CSS sanitization to protect against XSS attack vectors when rendering HTML and injection attack vectors in custom stylesheets.
- **🖨️ High-Fidelity PDF Export**: Native browser print integration with strict `@page` print rules to preserve paper dimensions, colors, and layout fidelity when saving to PDF.
- **💾 Import & Export**: Load template resumes (`/api/template`), upload local `.md` files, or save your work as Markdown.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown Processing**: [Marked](https://marked.js.org/)
- **Sanitization**: [DOMPurify](https://github.com/cure53/DOMPurify) & [JSDOM](https://github.com/jsdom/jsdom)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS
- **Testing**: Node.js Test Runner via [`tsx`](https://github.com/privatenumber/tsx)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v24.14.0 (managed via `.nvmrc`)
- **Package Manager**: `pnpm`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rajnish93/resume-compiler.git
   cd resume-compiler
   ```

2. Use the recommended Node version (`.nvmrc`):
   ```bash
   nvm use
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🧪 Testing & Quality

### Run Unit Tests

Execute the parser and sanitization test suite using Node's native test runner via `tsx`:

```bash
pnpm test
```

### Code Linting

Run ESLint to check for code quality and type safety:

```bash
pnpm lint
```

### Build for Production

Build the optimized application bundle:

```bash
pnpm build
```

---

## 📁 Project Structure

```text
resume-compiler/
├── data/
│   └── resume.md               # Default resume Markdown template
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── template/       # API endpoint serving default template
│   │   ├── globals.css         # Core CSS styles & print media queries
│   │   ├── layout.tsx          # Root Next.js layout
│   │   └── page.tsx            # Main Resume Compiler UI & preview engine
│   └── lib/
│       ├── __tests__/          # Unit test suites (Markdown parser & DOMPurify)
│       ├── parser.ts           # Markdown parsing & HTML/CSS sanitization logic
│       └── themes.ts           # Preset resume theme definitions
├── package.json
└── README.md
```

---

## 🛡️ Security

Resume Compiler processes user-supplied Markdown and CSS. To prevent Cross-Site Scripting (XSS) and malicious injection vulnerabilities:
- **DOMPurify** sanitizes all HTML parsed from Markdown before rendering.
- Links are sanitized and configured to open safely in external windows (`target="_blank"` with `rel="noopener noreferrer"`).
- Custom CSS inputs are sanitized to strip unsafe directives (such as `@import`, `javascript:`, or expression rules).

---

## 📄 License

This project is open-source and available under the MIT License.
