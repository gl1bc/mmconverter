import express from 'express';
import multer from 'multer';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkRehype from 'remark-rehype';
import rehypeMermaid from 'rehype-mermaid';
import rehypeStringify from 'rehype-stringify';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration from environment variables
const PORT = process.env.PORT || 3000;

const app = express();

// Set root directory (two levels up from src/server/)
const rootDir = path.join(__dirname, '..', '..');

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // UTF-8 filename decoding
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

    if (file.mimetype === 'text/markdown' || file.originalname.endsWith('.md')) {
      cb(null, true);
    } else {
      cb(new Error('Only .md files are allowed'));
    }
  }
});

// Serve static files
app.use(express.static(path.join(rootDir, 'public')));
app.use(express.json());

// Serve unified index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Markdown → HTML conversion
async function convertMarkdownToHtml(markdown) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkRehype)
    .use(rehypeMermaid, {
      strategy: 'inline-svg',
      mermaidConfig: {
        fontFamily: 'arial,sans-serif',
        flowchart: {
          padding: 15,
          nodeSpacing: 50,
          rankSpacing: 50,
          curve: 'basis',
          useMaxWidth: true,
          htmlLabels: true
        },
        themeVariables: {
          fontSize: '16px'
        }
      }
    })
    .use(rehypeStringify);

  const file = await processor.process(markdown);
  return String(file);
}

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const markdown = req.file.buffer.toString('utf-8');
    const html = await convertMarkdownToHtml(markdown);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({
      success: true,
      html,
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      error: 'Conversion failed',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🎨 Mermaid Converter running at http://localhost:${PORT}`);
  console.log(`📝 Open http://localhost:${PORT} in your browser`);
  console.log(`💡 Themes: Switch between Default and Spring in browser`);
});
