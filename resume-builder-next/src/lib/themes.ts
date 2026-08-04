export interface Theme {
  id: string;
  name: string;
  css: string;
}

export const THEMES: Record<string, Theme> = {
  modern: {
    id: "modern",
    name: "Modern (Inter & Sans)",
    css: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

html, body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #2d3748;
    line-height: 1.35;
    font-size: 9.5pt;
    background-color: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

.container {
    padding: 0;
}

h1 {
    font-size: 21pt;
    font-weight: 700;
    color: #1a365d;
    text-align: center;
    margin: 0 0 4px 0;
    letter-spacing: -0.5px;
}

.contact-row {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    font-size: 9pt;
    color: #4a5568;
    margin-top: 0;
    margin-bottom: 8px;
    line-height: 1.4;
}

.contact-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.contact-item svg {
    width: 12px;
    height: 12px;
    fill: currentColor;
    color: #2b6cb0;
}

.contact-row a {
    color: #4a5568;
    text-decoration: none;
    font-weight: 500;
}

.contact-row a:hover {
    text-decoration: underline;
    color: #2b6cb0;
}

hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 6px 0;
}

h2 {
    font-size: 11pt;
    font-weight: 700;
    color: #2b6cb0;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-top: 8px;
    margin-bottom: 4px;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 2px;
}

h3 {
    font-size: 10pt;
    font-weight: 600;
    color: #1a365d;
    margin-top: 6px;
    margin-bottom: 2px;
}

.meta-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 9pt;
    margin-top: 0;
    margin-bottom: 3px;
    color: #4a5568;
}

.meta-left {
    font-weight: 600;
    color: #2d3748;
}

.meta-right {
    color: #4a5568;
}

.meta-row em {
    font-style: normal;
}

ul {
    margin-top: 2px;
    margin-bottom: 4px;
    padding-left: 15px;
}

li {
    margin-bottom: 1.5px;
    color: #2d3748;
}

p {
    margin-top: 2px;
    margin-bottom: 4px;
}

strong {
    font-weight: 600;
}

ul li strong {
    color: #4a5568;
}`
  },
  classic: {
    id: "classic",
    name: "Classic (Playfair & Serif)",
    css: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Sans+Pro:wght@400;600;700&display=swap');

html, body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Source Sans Pro', 'Georgia', serif;
    color: #111111;
    line-height: 1.45;
    font-size: 10pt;
    background-color: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

h1 {
    font-family: 'Playfair Display', 'Times New Roman', serif;
    font-size: 24pt;
    font-weight: 700;
    text-align: center;
    color: #000000;
    margin: 0 0 4px 0;
}

.contact-row {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    font-size: 9pt;
    color: #333333;
    margin-top: 0;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.contact-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.contact-item svg {
    width: 11px;
    height: 11px;
    fill: currentColor;
}

.contact-row a {
    color: #111111;
    text-decoration: underline;
}

hr {
    border: none;
    border-top: 1px double #333333;
    margin: 12px 0;
}

h2 {
    font-family: 'Playfair Display', serif;
    font-size: 12pt;
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 15px;
    margin-bottom: 8px;
    border-bottom: 1px solid #333333;
    padding-bottom: 2px;
}

h3 {
    font-size: 10.5pt;
    font-weight: 700;
    margin-top: 10px;
    margin-bottom: 2px;
}

.meta-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 9.5pt;
    color: #444444;
    margin-top: 0;
    margin-bottom: 6px;
}

.meta-left {
    font-weight: 700;
}

.meta-right {
    color: #444444;
}

.meta-row em {
    font-style: normal;
}

ul {
    margin-top: 2px;
    margin-bottom: 8px;
    padding-left: 20px;
    list-style-type: square;
}

li {
    margin-bottom: 3px;
}`
  },
  minimal: {
    id: "minimal",
    name: "Minimal (Mono & Space Grotesk)",
    css: `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap');

html, body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    color: #1a1a1a;
    line-height: 1.35;
    font-size: 9.5pt;
    background-color: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

h1 {
    font-size: 24pt;
    font-weight: 700;
    color: #000000;
    margin: 0 0 6px 0;
    letter-spacing: -1px;
}

.contact-row {
    font-family: 'JetBrains Mono', monospace;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 8.5pt;
    color: #666666;
    margin-top: 0;
    margin-bottom: 15px;
}

.contact-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.contact-item svg {
    width: 11px;
    height: 11px;
    fill: currentColor;
}

.contact-row a {
    color: #000000;
    text-decoration: none;
    border-bottom: 1px solid #666666;
}

hr {
    border: none;
    border-top: 1px solid #e5e5e5;
    margin: 12px 0;
}

h2 {
    font-size: 11pt;
    font-weight: 700;
    color: #000000;
    margin-top: 16px;
    margin-bottom: 8px;
    letter-spacing: -0.3px;
}

h3 {
    font-size: 10pt;
    font-weight: 600;
    margin-top: 10px;
    margin-bottom: 2px;
}

.meta-row {
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 8.5pt;
    color: #666666;
    margin-top: 0;
    margin-bottom: 6px;
}

.meta-left {
    font-weight: 500;
    color: #1a1a1a;
}

.meta-right {
    color: #666666;
    font-family: 'JetBrains Mono', monospace;
}

.meta-row em {
    font-style: normal;
}

ul {
    margin-top: 2px;
    margin-bottom: 8px;
    padding-left: 15px;
}

li {
    margin-bottom: 3px;
}`
  }
};
