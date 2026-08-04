import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown, sanitizeCss } from '../parser';

describe('parseMarkdown - XSS Security & HTML Sanitization', () => {
  it('should strip script tags from input markdown', () => {
    const input = '# Hello\n<script>alert("XSS")</script>';
    const output = parseMarkdown(input);
    assert.equal(output.includes('<script>'), false);
    assert.equal(output.includes('alert("XSS")'), false);
    assert.equal(output.includes('<h1>Hello</h1>'), true);
  });

  it('should strip onerror and inline event attributes from images', () => {
    const input = '<img src="x" onerror="alert(1)" alt="test" />';
    const output = parseMarkdown(input);
    assert.equal(output.includes('onerror'), false);
    assert.equal(output.includes('alert(1)'), false);
    assert.equal(output.includes('<img src="x" alt="test"'), true);
  });

  it('should strip javascript: URLs from hyperlinks', () => {
    const input = '[Dangerous Link](javascript:alert("XSS"))';
    const output = parseMarkdown(input);
    assert.equal(output.includes('javascript:'), false);
    assert.equal(output.includes('alert'), false);
  });

  it('should strip dangerous HTML elements (iframe, object, embed, form)', () => {
    const input = `
<iframe src="https://evil.com"></iframe>
<object data="malicious.swf"></object>
<embed src="malicious.swf" />
<form action="https://evil.com"><input type="text" /></form>
    `;
    const output = parseMarkdown(input);
    assert.equal(output.includes('<iframe'), false);
    assert.equal(output.includes('<object'), false);
    assert.equal(output.includes('<embed'), false);
    assert.equal(output.includes('<form'), false);
  });

  it('should sanitize inline SVG XSS payloads', () => {
    const input = '<svg onload="alert(1)"><circle cx="50" cy="50" r="40" /></svg>';
    const output = parseMarkdown(input);
    assert.equal(output.includes('onload'), false);
    assert.equal(output.includes('alert'), false);
  });

  it('should correctly format resume meta-rows while sanitizing content', () => {
    const input = `### Software Engineer
**Tech Corp** | *2020 - Present* | *San Francisco, CA*`;
    const output = parseMarkdown(input);
    assert.equal(output.includes('<h3>Software Engineer</h3>'), true);
    assert.equal(output.includes('<div class="meta-row">'), true);
    assert.equal(output.includes('<span class="meta-left"><strong>Tech Corp</strong></span>'), true);
    assert.equal(output.includes('<span class="meta-right"><em>2020 - Present</em>, <em>San Francisco, CA</em></span>'), true);
  });

  it('should handle empty or whitespace input gracefully', () => {
    assert.equal(parseMarkdown(''), '');
  });
});

describe('sanitizeCss - CSS Injection Prevention', () => {
  it('should escape closing style tags to prevent style element breakout', () => {
    const maliciousCss = 'body { color: red; }</style><script>alert("CSS XSS")</script>';
    const sanitized = sanitizeCss(maliciousCss);
    assert.equal(sanitized.includes('</style'), false);
    assert.equal(sanitized.includes('\\3C/style'), true);
  });

  it('should handle empty CSS input gracefully', () => {
    assert.equal(sanitizeCss(''), '');
  });
});
