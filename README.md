# MOVO AI - AI 프레젠테이션 메이커

AI 기반 파워포인트 프레젠테이션 자동 생성 웹 애플리케이션입니다.

## 기능

- **대시보드**: 슬라이드 주제 입력, 슬라이드 개수 설정, 카테고리별 템플릿 갤러리
- **아웃라인 생성** (Step 1): AI가 자동으로 슬라이드 개요 생성 (제목, 키포인트, 비주얼 설명)
- **스타일 선택** (Step 2): 8가지 디자인 테마 (그라디언트 다크, 키노트 스타일, 화이트 심플 등)
- **고급 설정** (Step 3): 생성 모드, 디자인 밀도, 문체 톤, 색상, 타이포그래피 설정
- **에디터**: 슬라이드 편집기 (레이아웃 선택, 차트/표 스타일 변경)
- **내보내기**: Figma, PowerPoint, PDF, 이미지 포맷 지원

## 실행 방법

빌드 도구 없이 실행 가능합니다. `index.html` 파일을 브라우저에서 열면 됩니다.

```bash
# 간단한 HTTP 서버로 실행
npx serve .
# 또는
python3 -m http.server 8000
```

## 기술 스택

- HTML5 / CSS3 / Vanilla JavaScript
- Google Fonts (Noto Sans KR, Inter)
- Font Awesome 6 Icons