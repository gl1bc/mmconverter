import express from 'express';
import multer from 'multer';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeMermaid from 'rehype-mermaid';
import rehypeStringify from 'rehype-stringify';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Multer 설정 (파일 업로드)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // UTF-8 파일명 디코딩
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

    if (file.mimetype === 'text/markdown' || file.originalname.endsWith('.md')) {
      cb(null, true);
    } else {
      cb(new Error('Only .md files are allowed'));
    }
  }
});

// 정적 파일 제공 - Spring 테마 전용 디렉토리
app.use(express.static('public'));
app.use(express.json());

// 기본 경로에서 통합 HTML 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Markdown → HTML 변환 함수
async function convertMarkdownToHtml(markdown) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeMermaid, {
      strategy: 'inline-svg'
    })
    .use(rehypeStringify);

  const file = await processor.process(markdown);
  return String(file);
}

// 파일 업로드 엔드포인트
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
  console.log(`🔄 Switch between Default and Spring themes!`);
  console.log(`💡 Theme files: /themes/default.css, /themes/spring.css`);
});
