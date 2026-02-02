#!/usr/bin/env node

/**
 * Mermaid Markdown Converter - CLI Tool
 *
 * Converts Markdown files with Mermaid diagrams to HTML
 * using unified, remark, rehype, and rehype-mermaid
 *
 * Usage: node mermaid-converter.js <input.md> [output.html]
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeMermaid from 'rehype-mermaid';
import rehypeStringify from 'rehype-stringify';
import { readFile, writeFile } from 'fs/promises';

// Get command line arguments
const args = process.argv.slice(2);
const SOURCE_FILE = args[0];
const OUTPUT_FILE = args[1] || 'output.html';

async function convertMarkdownToHtml() {
  try {
    if (!SOURCE_FILE) {
      console.error('❌ Error: No input file specified');
      console.log('Usage: node mermaid-converter.js <input.md> [output.html]');
      process.exit(1);
    }

    console.log('Reading source file:', SOURCE_FILE);
    const markdown = await readFile(SOURCE_FILE, 'utf-8');

    console.log('Processing markdown with Mermaid diagrams...');
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeMermaid, {
        // Strategy options: 'img-png', 'img-svg', 'inline-svg', 'pre-mermaid'
        strategy: 'inline-svg'
      })
      .use(rehypeStringify);

    const file = await processor.process(markdown);
    const html = String(file);

    // Wrap in HTML document
    const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mermaid Diagram Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1, h2, h3, h4 { color: #333; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
    svg { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${html}
</body>
</html>`;

    console.log('Writing output to:', OUTPUT_FILE);
    await writeFile(OUTPUT_FILE, fullHtml, 'utf-8');

    console.log('✅ Conversion completed successfully!');
    console.log('Output file:', OUTPUT_FILE);
  } catch (error) {
    console.error('❌ Error during conversion:', error);
    process.exit(1);
  }
}

convertMarkdownToHtml();
