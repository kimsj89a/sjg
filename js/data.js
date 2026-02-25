// ===== Template Data =====
const TEMPLATES = [
  {
    id: 1, name: '투자 피칭덱', category: 'business',
    colors: { bg: 'linear-gradient(135deg, #667EEA, #764BA2)', text: '#FFF' },
    preview: { title: '투자 피칭덱', subtitle: '시리즈 A 라운드' }
  },
  {
    id: 2, name: '분기 실적 보고', category: 'report',
    colors: { bg: '#FFFFFF', text: '#1A1A2E', border: '#E5E7EB' },
    preview: { title: 'Q4 실적 보고', subtitle: '2025년 4분기 성과 분석' }
  },
  {
    id: 3, name: '제품 소개서', category: 'business',
    colors: { bg: 'linear-gradient(135deg, #4F46E5, #06B6D4)', text: '#FFF' },
    preview: { title: '제품 소개서', subtitle: '혁신적인 SaaS 솔루션' }
  },
  {
    id: 4, name: '마케팅 전략', category: 'business',
    colors: { bg: 'linear-gradient(135deg, #F97316, #EF4444)', text: '#FFF' },
    preview: { title: '마케팅 전략', subtitle: '2026 디지털 마케팅 플랜' }
  },
  {
    id: 5, name: '연간 리포트', category: 'research',
    colors: { bg: '#1A1A2E', text: '#FFF' },
    preview: { title: '연간 리포트', subtitle: 'Annual Report 2025' }
  },
  {
    id: 6, name: '교육 자료', category: 'education',
    colors: { bg: 'linear-gradient(135deg, #10B981, #3B82F6)', text: '#FFF' },
    preview: { title: '교육 자료', subtitle: '온보딩 트레이닝' }
  },
  {
    id: 7, name: '크리에이티브 포트폴리오', category: 'creative',
    colors: { bg: 'linear-gradient(135deg, #EC4899, #8B5CF6)', text: '#FFF' },
    preview: { title: '포트폴리오', subtitle: 'Creative Works 2025' }
  },
  {
    id: 8, name: '프로젝트 제안서', category: 'report',
    colors: { bg: '#F8F9FC', text: '#1A1A2E', border: '#E5E7EB' },
    preview: { title: '프로젝트 제안서', subtitle: '신규 사업 기획안' }
  },
  {
    id: 9, name: '스타트업 소개', category: 'business',
    colors: { bg: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)', text: '#FFF' },
    preview: { title: '스타트업 소개', subtitle: '우리가 만드는 미래' }
  },
  {
    id: 10, name: '데이터 분석 보고서', category: 'research',
    colors: { bg: '#0D1117', text: '#C9D1D9' },
    preview: { title: '데이터 분석', subtitle: 'Data-Driven Insights' }
  },
  {
    id: 11, name: '워크숍 자료', category: 'education',
    colors: { bg: 'linear-gradient(135deg, #FBBF24, #F97316)', text: '#FFF' },
    preview: { title: '워크숍', subtitle: 'Design Thinking Workshop' }
  },
  {
    id: 12, name: '브랜드 가이드라인', category: 'creative',
    colors: { bg: '#1E1E2E', text: '#CDD6F4' },
    preview: { title: '브랜드 가이드', subtitle: 'Brand Identity Guide' }
  }
];

// ===== Style Themes =====
const STYLES = [
  {
    id: 'gradient-dark',
    name: '그라디언트 다크',
    theme: 'dark',
    colors: {
      bg: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
      text: '#FFFFFF',
      subtitle: '#94A3B8',
      accent: '#6366F1',
      chartColors: ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE']
    }
  },
  {
    id: 'creative-playful',
    name: '크리에이티브 플레이풀',
    theme: 'light',
    colors: {
      bg: 'linear-gradient(135deg, #FDF2F8, #FCE7F3, #FBCFE8)',
      text: '#831843',
      subtitle: '#BE185D',
      accent: '#EC4899',
      chartColors: ['#EC4899', '#F472B6', '#FBCFE8', '#FCE7F3']
    }
  },
  {
    id: 'keynote-style',
    name: '키노트 스타일',
    theme: 'dark',
    colors: {
      bg: '#000000',
      text: '#FFFFFF',
      subtitle: '#A1A1AA',
      accent: '#3B82F6',
      chartColors: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE']
    }
  },
  {
    id: 'white-simple',
    name: '화이트 심플',
    theme: 'light',
    colors: {
      bg: '#FFFFFF',
      text: '#111827',
      subtitle: '#6B7280',
      accent: '#4F46E5',
      chartColors: ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC']
    }
  },
  {
    id: 'graphic-studio',
    name: '그래픽 스튜디오',
    theme: 'dark',
    colors: {
      bg: '#1E1E2E',
      text: '#CDD6F4',
      subtitle: '#7F849C',
      accent: '#89B4FA',
      chartColors: ['#89B4FA', '#74C7EC', '#94E2D5', '#A6E3A1']
    }
  },
  {
    id: 'vc-startup',
    name: 'VC 스타트업',
    theme: 'dark',
    colors: {
      bg: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      text: '#FFFFFF',
      subtitle: '#E2E8F0',
      accent: '#FBBF24',
      chartColors: ['#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7']
    }
  },
  {
    id: 'dark-tech',
    name: '다크 테크',
    theme: 'dark',
    colors: {
      bg: 'linear-gradient(180deg, #0D1117 0%, #161B22 100%)',
      text: '#C9D1D9',
      subtitle: '#8B949E',
      accent: '#58A6FF',
      chartColors: ['#58A6FF', '#79C0FF', '#A5D6FF', '#C8E1FF']
    }
  },
  {
    id: 'magazine-editorial',
    name: '매거진 에디토리얼',
    theme: 'light',
    colors: {
      bg: '#F5F0EB',
      text: '#2D2D2D',
      subtitle: '#666666',
      accent: '#C0392B',
      chartColors: ['#C0392B', '#E74C3C', '#F1948A', '#FADBD8']
    }
  }
];

// ===== Generate Outline Data =====
function generateOutlineData(topic, slideCount) {
  const defaultOutlines = {
    '투자 피칭덱': [
      { title: '회사 소개 및 비전', type: '표지', keypoints: ['회사명과 로고', '핵심 비전 한 줄 요약', '투자 라운드 정보'], visual: '풀스크린 히어로 이미지와 회사 로고' },
      { title: '해결하는 문제', type: '콘텐츠', keypoints: ['시장의 핵심 페인포인트', '기존 솔루션의 한계', '정량적 문제 규모'], visual: '문제 상황을 보여주는 인포그래픽' },
      { title: '솔루션 소개', type: '콘텐츠', keypoints: ['핵심 제품/서비스 설명', '차별화 포인트 3가지', '기술적 우위'], visual: '제품 스크린샷 또는 데모 이미지' },
      { title: '시장 규모 (TAM/SAM/SOM)', type: '데이터', keypoints: ['TAM: 전체 시장 규모', 'SAM: 접근 가능 시장', 'SOM: 단기 목표 시장'], visual: '동심원 차트로 시장 규모 시각화' },
      { title: '비즈니스 모델', type: '콘텐츠', keypoints: ['수익 모델 구조', '주요 가격 정책', '단위 경제학 (Unit Economics)'], visual: '비즈니스 모델 플로우차트' },
      { title: '트랙션 및 성과', type: '데이터', keypoints: ['핵심 KPI 성장 추이', '주요 마일스톤', '고객 성공 사례'], visual: '성장 그래프와 KPI 대시보드' },
      { title: '경쟁 분석', type: '콘텐츠', keypoints: ['주요 경쟁사 비교', '핵심 차별화 요소', '진입 장벽'], visual: '경쟁사 비교 매트릭스 표' },
      { title: '팀 소개', type: '콘텐츠', keypoints: ['핵심 팀원 프로필', '관련 경력 및 전문성', '어드바이저 네트워크'], visual: '팀원 사진과 약력 카드' },
      { title: '재무 계획', type: '데이터', keypoints: ['향후 3년 매출 전망', '손익 구조', '주요 비용 항목'], visual: '재무 추이 차트와 표' },
      { title: '투자 요청', type: '콘텐츠', keypoints: ['투자 금액 및 밸류에이션', '자금 사용 계획', '연락처 및 다음 단계'], visual: '투자 요약과 CTA 디자인' }
    ],
    '분기 실적 보고': [
      { title: '분기 실적 개요', type: '표지', keypoints: ['보고 기간', '핵심 성과 요약', '전분기 대비 변화'], visual: '깔끔한 타이틀 슬라이드' },
      { title: '핵심 KPI 요약', type: '데이터', keypoints: ['매출, 영업이익, 순이익', 'MoM/QoQ 성장률', '목표 달성률'], visual: 'KPI 카드 대시보드' },
      { title: '매출 분석', type: '데이터', keypoints: ['제품/서비스별 매출', '지역별 매출 분포', '신규 vs 기존 고객 매출'], visual: '매출 비교 막대 그래프' },
      { title: '비용 구조 분석', type: '데이터', keypoints: ['주요 비용 항목 분류', '전분기 대비 비용 변화', '비용 효율화 성과'], visual: '비용 구조 파이차트' },
      { title: '고객 지표', type: '데이터', keypoints: ['신규 고객 수', '이탈률(Churn Rate)', 'NPS 점수'], visual: '고객 지표 트렌드 라인차트' },
      { title: '주요 성과 및 이벤트', type: '콘텐츠', keypoints: ['분기 핵심 이정표', '신제품 출시 결과', '파트너십 및 협업'], visual: '타임라인 인포그래픽' },
      { title: '상위 성과 콘텐츠 심층 분석', type: '데이터', keypoints: ['직장인 필수 엑셀 단축키 모음 (조회 45.2K)', '신제품 언박싱 & 리얼 리뷰 (조회 38.5K)', '팔로워 1만 달성 감사 이벤트 (조회 2,150)'], visual: '콘텐츠 성과 카드 3열 레이아웃' },
      { title: '향후 SNS 콘텐츠 운영 개선 전략', type: '콘텐츠', keypoints: ['콘텐츠 유형 다각화 방안', '인플루언서 협업 확대 계획', '데이터 기반 콘텐츠 최적화'], visual: '전략 로드맵 다이어그램' },
      { title: '차분기 목표 및 전략', type: '콘텐츠', keypoints: ['매출 목표', '중점 추진 과제', '리소스 배분 계획'], visual: '목표 로드맵' },
      { title: '결론 및 질의응답', type: '콘텐츠', keypoints: ['핵심 메시지 3가지 요약', '경영진 코멘트', 'Q&A 세션'], visual: '요약 및 연락처' }
    ],
    '제품 소개서': [
      { title: '제품 소개', type: '표지', keypoints: ['제품명과 태그라인', '핵심 가치 제안', '대상 고객'], visual: '제품 히어로 이미지' },
      { title: '문제 인식', type: '콘텐츠', keypoints: ['고객이 겪는 문제', '기존 솔루션의 한계', '시장 기회'], visual: '문제 상황 일러스트' },
      { title: '핵심 기능', type: '콘텐츠', keypoints: ['주요 기능 1: AI 자동화', '주요 기능 2: 실시간 협업', '주요 기능 3: 맞춤형 분석'], visual: '기능별 아이콘과 설명' },
      { title: '작동 방식', type: '콘텐츠', keypoints: ['Step 1: 입력', 'Step 2: AI 처리', 'Step 3: 결과 확인'], visual: '3단계 플로우 다이어그램' },
      { title: '경쟁 우위', type: '콘텐츠', keypoints: ['속도 10배 향상', '비용 70% 절감', '정확도 99.5%'], visual: '경쟁사 비교 표' },
      { title: '고객 사례', type: '콘텐츠', keypoints: ['A사: 매출 200% 성장', 'B사: 운영 비용 50% 절감', 'C사: 고객 만족도 95%'], visual: '고객 로고 및 인용구' },
      { title: '가격 정책', type: '데이터', keypoints: ['Free / Pro / Enterprise', '기능별 비교', '커스텀 견적'], visual: '가격 테이블' },
      { title: '로드맵', type: '콘텐츠', keypoints: ['Q1: 모바일 앱 출시', 'Q2: API 확장', 'Q3: 글로벌 진출'], visual: '타임라인 로드맵' },
      { title: '기술 스택', type: '콘텐츠', keypoints: ['클라우드 인프라', '보안 인증', 'API 연동'], visual: '기술 아키텍처 다이어그램' },
      { title: '시작하기', type: '콘텐츠', keypoints: ['무료 체험 안내', '데모 신청 QR코드', '연락처'], visual: 'CTA 버튼과 QR코드' }
    ]
  };

  // Default generic outline
  const genericOutline = [
    { title: '소개 및 목차', type: '표지', keypoints: ['프레젠테이션 주제 소개', '발표 목차', '핵심 키워드'], visual: '타이틀 슬라이드 디자인' },
    { title: '배경 및 현황', type: '콘텐츠', keypoints: ['현재 상황 분석', '주요 트렌드', '데이터 기반 인사이트'], visual: '현황 분석 인포그래픽' },
    { title: '핵심 분석', type: '데이터', keypoints: ['정량적 데이터 분석', '비교 분석 결과', '핵심 발견사항'], visual: '데이터 차트와 그래프' },
    { title: '전략 및 방향', type: '콘텐츠', keypoints: ['추진 전략 3가지', '실행 계획', '기대 효과'], visual: '전략 프레임워크 다이어그램' },
    { title: '세부 실행 계획', type: '콘텐츠', keypoints: ['단계별 계획', '일정 및 마일스톤', '담당자 배정'], visual: '간트차트 또는 타임라인' },
    { title: '예산 및 리소스', type: '데이터', keypoints: ['예산 배분', '필요 리소스', 'ROI 예측'], visual: '예산 분배 차트' },
    { title: '리스크 관리', type: '콘텐츠', keypoints: ['주요 리스크 요인', '대응 방안', '모니터링 계획'], visual: '리스크 매트릭스' },
    { title: '성공 사례', type: '콘텐츠', keypoints: ['벤치마킹 사례', '핵심 교훈', '적용 방안'], visual: '사례 카드 레이아웃' },
    { title: '기대 효과', type: '데이터', keypoints: ['정량적 목표', '정성적 효과', 'KPI 설정'], visual: '목표 달성 대시보드' },
    { title: '결론 및 Q&A', type: '콘텐츠', keypoints: ['핵심 메시지 요약', '다음 단계', '질의응답'], visual: '요약 슬라이드' }
  ];

  // Try to find a matching template
  let outline = defaultOutlines[topic] || null;

  if (!outline) {
    // Generate based on topic
    outline = genericOutline.map((item, i) => ({
      ...item,
      title: i === 0 ? `${topic} - ${item.title}` : item.title
    }));
  }

  // Adjust to requested slide count
  if (slideCount < outline.length) {
    outline = outline.slice(0, slideCount);
  } else if (slideCount > outline.length) {
    const extra = slideCount - outline.length;
    for (let i = 0; i < extra; i++) {
      outline.push({
        title: `추가 슬라이드 ${outline.length + 1}`,
        type: '콘텐츠',
        keypoints: ['추가 내용을 입력하세요'],
        visual: '자유 레이아웃'
      });
    }
  }

  return outline;
}

// ===== Generate Editor Slides =====
function generateEditorSlides(outline, style) {
  return outline.map((item, index) => ({
    id: index + 1,
    title: item.title,
    type: item.type,
    keypoints: item.keypoints,
    visual: item.visual,
    style: style
  }));
}
