# Mermaid Markdown Converter

Markdown 파일의 Mermaid 다이어그램을 HTML로 변환하는 웹 애플리케이션

## 주요 기능

- 📄 **드래그 앤 드롭 업로드**: 간편한 파일 업로드 인터페이스
- 🎨 **멀티 테마**: Default (Brutalism), Spring 테마 지원
- 🔄 **자동 변환**: 파일 업로드 시 즉시 미리보기
- ⬇️ **HTML 내보내기**: 스타일이 포함된 HTML 다운로드
- 📱 **반응형 디자인**: 데스크톱, 모바일 지원
- 🎯 **Floating 업로드**: 스크롤 기반 업로드 위젯
- 🔍 **Intersection Observer**: 스크롤 위치 기반 스마트 UI

## 빠른 시작

### 설치

```bash
npm install
```

### 서버 실행

```bash
# 기본 포트 3000에서 실행
npm start

# 커스텀 포트 지정
PORT=8080 npm start
```

**테마 전환**: 브라우저에서 우측 상단의 테마 버튼으로 Default/Spring 간 전환

### CLI 변환 도구

```bash
# 단일 마크다운 파일 변환
npm run convert input.md output.html

# 직접 실행
node src/cli/mermaid-converter.js input.md output.html
```

## 프로젝트 구조

```
mmconvert/
├── src/
│   ├── server/            # Express 서버 파일들
│   │   ├── server.js      # 통합 서버 (메인)
│   │   ├── server-spring.js    # Spring 테마 서버
│   │   └── server-unified.js   # Unified 테마 서버
│   └── cli/               # CLI 도구
│       └── mermaid-converter.js  # Markdown → HTML 변환 CLI
├── public/                # 정적 리소스
│   ├── index.html         # 통합 HTML (동적 테마 로딩)
│   └── themes/
│       ├── default.css    # Brutalism 테마
│       └── spring.css     # Spring 테마
├── package.json           # 의존성 및 스크립트
├── Dockerfile             # Docker 이미지 빌드 설정
├── .dockerignore          # Docker 빌드 제외 파일
└── README.md
```

## 환경 변수

- `PORT` - 서버 포트 (기본값: 3000)
- `NODE_ENV` - Node.js 환경 (production/development)

## 테마

### Default (Brutalism)
- Courier New 폰트
- 흑백 컬러 스킴
- 굵은 테두리, 대문자 텍스트
- 미니멀리스트 디자인

### Spring
- 시스템 폰트
- 녹색 컬러 팔레트 (#2f845e)
- 둥근 모서리, 부드러운 그림자
- 모던하고 깔끔한 디자인

## API 엔드포인트

### `POST /api/upload`
마크다운 파일 업로드 및 변환

**요청:**
- Content-Type: multipart/form-data
- Body: file (*.md)

**응답:**
```json
{
  "success": true,
  "html": "<변환된 html>",
  "filename": "example.md"
}
```

## 기술 스택

### 백엔드
- **Express.js**: 웹 서버 프레임워크
- **Multer**: 파일 업로드 처리

### 마크다운 처리
- **unified**: 통합 텍스트 처리 프레임워크
- **remark-parse**: Markdown → MDAST 파싱
- **remark-gfm**: GitHub Flavored Markdown 지원
- **remark-rehype**: MDAST → HAST 변환
- **rehype-mermaid**: Mermaid 다이어그램 → SVG 렌더링 (inline-svg)
- **rehype-stringify**: HAST → HTML 직렬화
- **Playwright**: Mermaid 렌더링을 위한 headless 브라우저

### 프론트엔드
- Vanilla JavaScript
- CSS3 (Custom Properties, Animations)
- Intersection Observer API
- Drag and Drop API

## 변환 파이프라인

```
Markdown
  → remark-parse
  → remark-gfm
  → remark-rehype
  → rehype-mermaid
  → rehype-stringify
  → HTML
```

## 지원하는 Mermaid 다이어그램

- ✅ Pie Chart
- ✅ Flowchart (Graph LR, TD)
- ✅ Class Diagram
- ✅ Gantt Chart
- ✅ Git Graph
- ✅ Mindmap
- ✅ Timeline
- ✅ ERD (Entity Relationship Diagram)
- ✅ User Journey
- ✅ Quadrant Chart
- ✅ XY Chart

## 브라우저 지원

- Chrome/Edge (최신)
- Firefox (최신)
- Safari (최신)

## Docker 배포

### 로컬 개발 (Mac/Windows)

```bash
# 이미지 빌드
docker build -t mmconvert:latest .

# 컨테이너 실행 (포트 3000)
docker run -d -p 3000:3000 --name mmconvert mmconvert:latest

# 커스텀 포트로 실행
docker run -d -p 8080:8080 -e PORT=8080 --name mmconvert mmconvert:latest

# 로그 확인
docker logs -f mmconvert

# 컨테이너 중지
docker stop mmconvert && docker rm mmconvert
```

### AWS ECS 배포 (Cross-Platform Build)

Mac에서 Linux AMD64용 이미지 빌드:

```bash
# Linux AMD64용 크로스 빌드
docker buildx build --platform linux/amd64 -t megazone/mmconverter:latest .

# ECR에 푸시
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin [YOUR-ECR-URL]

docker tag megazone/mmconverter:latest [YOUR-ECR-URL]/mmconverter:latest
docker push [YOUR-ECR-URL]/mmconverter:latest
```

**테마 전환**: 브라우저에서 Default/Spring 버튼으로 전환

