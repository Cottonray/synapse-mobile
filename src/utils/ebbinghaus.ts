import { StudyRecord, ForgettingCurveData } from '../types';

// 에빙하우스 망각곡선 상수
const FORGETTING_CURVE_CONSTANTS = {
  // 망각 곡선의 기본 감쇠율
  DECAY_RATE: 0.5,
  // 난이도별 가중치
  DIFFICULTY_WEIGHTS: {
    easy: 0.8,
    medium: 1.0,
    hard: 1.3,
  },
  // 복습 간격 (일)
  REVIEW_INTERVALS: [1, 3, 7, 14, 30, 90],
};

/**
 * 에빙하우스 망각곡선에 따른 망각률 계산
 * @param daysSinceLastStudy 마지막 학습 후 경과 일수
 * @param difficulty 개념의 난이도
 * @param correctnessRate 정답률 (0-1)
 * @returns 망각률 (0-1, 1에 가까울수록 많이 망각)
 */
export const calculateForgettingRate = (
  daysSinceLastStudy: number,
  difficulty: 'easy' | 'medium' | 'hard',
  correctnessRate: number,
): number => {
  const difficultyWeight =
    FORGETTING_CURVE_CONSTANTS.DIFFICULTY_WEIGHTS[difficulty];
  const retentionFactor = correctnessRate; // 정답률이 높을수록 기억 유지율 높음

  // 에빙하우스 공식: R = e^(-t/S)
  // R: 기억 유지율, t: 시간, S: 기억 강도
  const memoryStrength = (10 * retentionFactor) / difficultyWeight;
  const retentionRate = Math.exp(-daysSinceLastStudy / memoryStrength);

  return Math.max(0, Math.min(1, 1 - retentionRate));
};

/**
 * 다음 복습 일정 계산
 * @param studyRecords 학습 기록 배열
 * @param difficulty 개념의 난이도
 * @returns 다음 복습 날짜
 */
export const calculateNextReviewDate = (
  studyRecords: StudyRecord[],
  difficulty: 'easy' | 'medium' | 'hard',
): Date => {
  const reviewCount = studyRecords.length;
  const lastStudy = studyRecords[studyRecords.length - 1];

  if (!lastStudy) {
    return new Date(); // 첫 학습이면 바로 복습
  }

  // 평균 정답률 계산
  const avgCorrectness =
    studyRecords.reduce((sum, record) => sum + record.correctness, 0) /
    reviewCount;

  // 복습 간격 인덱스 계산 (정답률이 높을수록 간격이 길어짐)
  const intervalIndex = Math.min(
    Math.floor(reviewCount * avgCorrectness),
    FORGETTING_CURVE_CONSTANTS.REVIEW_INTERVALS.length - 1,
  );

  const baseInterval =
    FORGETTING_CURVE_CONSTANTS.REVIEW_INTERVALS[intervalIndex];
  const difficultyWeight =
    FORGETTING_CURVE_CONSTANTS.DIFFICULTY_WEIGHTS[difficulty];
  const adjustedInterval = Math.round(baseInterval / difficultyWeight);

  const nextReviewDate = new Date(lastStudy.studiedAt);
  nextReviewDate.setDate(nextReviewDate.getDate() + adjustedInterval);

  return nextReviewDate;
};

/**
 * 망각곡선 데이터 생성
 * @param conceptId 개념 ID
 * @param studyRecords 학습 기록
 * @param difficulty 난이도
 * @returns 망각곡선 데이터
 */
export const generateForgettingCurveData = (
  conceptId: string,
  studyRecords: StudyRecord[],
  difficulty: 'easy' | 'medium' | 'hard',
): ForgettingCurveData => {
  if (studyRecords.length === 0) {
    return {
      conceptId,
      forgettingRate: 1.0, // 학습하지 않았으면 완전히 망각
      nextReviewDate: new Date(),
      priority: 'high',
    };
  }

  const lastStudy = studyRecords[studyRecords.length - 1];
  const daysSinceLastStudy = Math.floor(
    (Date.now() - lastStudy.studiedAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  const avgCorrectness =
    studyRecords.reduce((sum, record) => sum + record.correctness, 0) /
    studyRecords.length;

  const forgettingRate = calculateForgettingRate(
    daysSinceLastStudy,
    difficulty,
    avgCorrectness,
  );
  const nextReviewDate = calculateNextReviewDate(studyRecords, difficulty);

  // 우선순위 결정
  let priority: 'high' | 'medium' | 'low' = 'low';
  if (forgettingRate > 0.7) priority = 'high';
  else if (forgettingRate > 0.4) priority = 'medium';

  return {
    conceptId,
    forgettingRate,
    nextReviewDate,
    priority,
  };
};

/**
 * 거의 잊혀져가는 개념들 필터링
 * @param forgettingCurveData 망각곡선 데이터 배열
 * @param threshold 임계값 (기본값: 0.6)
 * @returns 거의 잊혀져가는 개념들
 */
export const getAlmostForgottenConcepts = (
  forgettingCurveData: ForgettingCurveData[],
  threshold: number = 0.6,
): ForgettingCurveData[] => {
  return forgettingCurveData
    .filter(data => data.forgettingRate >= threshold)
    .sort((a, b) => b.forgettingRate - a.forgettingRate); // 망각률 높은 순으로 정렬
};
