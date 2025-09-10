// 첨부파일 타입
export interface Attachment {
  id: string;
  conceptId: string;
  fileName: string;
  filePath: string;
  fileType: 'image' | 'video' | 'audio' | 'document';
  fileSize: number;
  createdAt: Date;
}

// 개념 관련 타입 정의
export interface Concept {
  id: string;
  title: string;
  subtitle?: string;
  description: string; // content -> description으로 변경
  category: string;
  createdAt: string; // Date -> string으로 변경 (ISO string)
  updatedAt: string; // Date -> string으로 변경 (ISO string)
  isFavorite: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  attachments?: Attachment[];
  color?: string; // 개념별 색상 테마
  priority: number; // 우선순위 (1-5)
  estimatedStudyTime?: number; // 예상 학습 시간 (분)
}

// 학습 기록 타입
export interface StudyRecord {
  id: string;
  conceptId: string;
  studiedAt: Date;
  correctness: number; // 0-1 사이 값 (정답률)
  responseTime: number; // 응답 시간 (밀리초)
  reviewCount: number; // 복습 횟수
}

// 플립카드 타입
export interface FlipCard {
  id: string;
  conceptId: string;
  front: string; // 질문
  back: string; // 답변
  createdAt: Date;
  updatedAt: Date;
}

// 망각곡선 계산 결과
export interface ForgettingCurveData {
  conceptId: string;
  forgettingRate: number; // 0-1 사이 값 (망각 정도)
  nextReviewDate: Date;
  priority: 'high' | 'medium' | 'low';
  lastStudied?: string; // 마지막 학습일
  daysUntilForgotten?: number; // 완전히 잊혀지기까지 남은 일수
}

// 홈화면 카드 타입
export interface HomeCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  count: number;
  color: string;
  onPress: () => void;
}
