import { database } from '../database';
import { StudyRecord, ForgettingCurveData } from '../../types';
import { generateId } from '../../utils/helpers';
import {
  generateForgettingCurveData,
  getAlmostForgottenConcepts,
} from '../../utils/ebbinghaus';

export interface CreateStudyRecordData {
  conceptId: string;
  correctness: number;
  responseTime?: number;
  studyType?: 'flashcard' | 'quiz' | 'review' | 'practice';
}

export interface StudyStats {
  totalStudySessions: number;
  averageCorrectness: number;
  totalStudyTime: number; // 분 단위
  streakDays: number;
  conceptsStudied: number;
  lastStudyDate?: Date;
}

export class StudyRecordService {
  // 학습 기록 생성
  async createStudyRecord(data: CreateStudyRecordData): Promise<StudyRecord> {
    const recordId = generateId();
    const now = new Date().toISOString();

    // 이전 복습 횟수 조회
    const previousRecords = await database.executeSql(
      'SELECT COUNT(*) as count FROM study_records WHERE concept_id = ?',
      [data.conceptId],
    );
    const reviewCount = previousRecords.rows.item(0).count + 1;

    const studyRecord: StudyRecord = {
      id: recordId,
      conceptId: data.conceptId,
      studiedAt: new Date(now),
      correctness: data.correctness,
      responseTime: data.responseTime || 0,
      reviewCount,
    };

    try {
      await database.executeSql(
        `INSERT INTO study_records (
          id, concept_id, studied_at, correctness, response_time, review_count, study_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          recordId,
          data.conceptId,
          now,
          data.correctness,
          data.responseTime || 0,
          reviewCount,
          data.studyType || 'review',
        ],
      );

      // 망각곡선 캐시 업데이트
      await this.updateForgettingCurveCache(data.conceptId);

      return studyRecord;
    } catch (error) {
      console.error('Error creating study record:', error);
      throw error;
    }
  }

  // 개념별 학습 기록 조회
  async getStudyRecordsByConceptId(conceptId: string): Promise<StudyRecord[]> {
    try {
      const result = await database.executeSql(
        'SELECT * FROM study_records WHERE concept_id = ? ORDER BY studied_at DESC',
        [conceptId],
      );

      const records: StudyRecord[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        records.push(this.mapRowToStudyRecord(row));
      }

      return records;
    } catch (error) {
      console.error('Error getting study records by concept ID:', error);
      throw error;
    }
  }

  // 최근 학습 기록 조회
  async getRecentStudyRecords(limit: number = 20): Promise<StudyRecord[]> {
    try {
      const result = await database.executeSql(
        'SELECT * FROM study_records ORDER BY studied_at DESC LIMIT ?',
        [limit],
      );

      const records: StudyRecord[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        records.push(this.mapRowToStudyRecord(row));
      }

      return records;
    } catch (error) {
      console.error('Error getting recent study records:', error);
      throw error;
    }
  }

  // 특정 기간의 학습 기록 조회
  async getStudyRecordsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<StudyRecord[]> {
    try {
      const result = await database.executeSql(
        'SELECT * FROM study_records WHERE studied_at BETWEEN ? AND ? ORDER BY studied_at DESC',
        [startDate.toISOString(), endDate.toISOString()],
      );

      const records: StudyRecord[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        records.push(this.mapRowToStudyRecord(row));
      }

      return records;
    } catch (error) {
      console.error('Error getting study records by date range:', error);
      throw error;
    }
  }

  // 학습 통계 조회
  async getStudyStats(): Promise<StudyStats> {
    try {
      // 총 학습 세션 수
      const totalSessionsResult = await database.executeSql(
        'SELECT COUNT(*) as count FROM study_records',
      );
      const totalStudySessions = totalSessionsResult.rows.item(0).count;

      // 평균 정답률
      const avgCorrectnessResult = await database.executeSql(
        'SELECT AVG(correctness) as avg FROM study_records',
      );
      const averageCorrectness = avgCorrectnessResult.rows.item(0).avg || 0;

      // 총 학습 시간 (응답 시간 합계를 분으로 변환)
      const totalTimeResult = await database.executeSql(
        'SELECT SUM(response_time) as total FROM study_records',
      );
      const totalStudyTime = Math.round(
        (totalTimeResult.rows.item(0).total || 0) / 60000,
      );

      // 학습한 개념 수
      const conceptsStudiedResult = await database.executeSql(
        'SELECT COUNT(DISTINCT concept_id) as count FROM study_records',
      );
      const conceptsStudied = conceptsStudiedResult.rows.item(0).count;

      // 마지막 학습 날짜
      const lastStudyResult = await database.executeSql(
        'SELECT MAX(studied_at) as last_date FROM study_records',
      );
      const lastStudyDate = lastStudyResult.rows.item(0).last_date
        ? new Date(lastStudyResult.rows.item(0).last_date)
        : undefined;

      // 연속 학습 일수 계산
      const streakDays = await this.calculateStreakDays();

      return {
        totalStudySessions,
        averageCorrectness,
        totalStudyTime,
        streakDays,
        conceptsStudied,
        lastStudyDate,
      };
    } catch (error) {
      console.error('Error getting study stats:', error);
      throw error;
    }
  }

  // 망각곡선 데이터 조회
  async getForgettingCurveData(): Promise<ForgettingCurveData[]> {
    try {
      const result = await database.executeSql(
        `SELECT fc.*, c.difficulty 
         FROM forgetting_curve_cache fc 
         JOIN concepts c ON fc.concept_id = c.id 
         ORDER BY fc.forgetting_rate DESC`,
      );

      const data: ForgettingCurveData[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        data.push({
          conceptId: row.concept_id,
          forgettingRate: row.forgetting_rate,
          nextReviewDate: new Date(row.next_review_date),
          priority: row.priority,
        });
      }

      return data;
    } catch (error) {
      console.error('Error getting forgetting curve data:', error);
      return [];
    }
  }

  // 거의 잊혀져가는 개념 조회
  async getAlmostForgottenConcepts(
    threshold: number = 0.6,
  ): Promise<ForgettingCurveData[]> {
    const allData = await this.getForgettingCurveData();
    return getAlmostForgottenConcepts(allData, threshold);
  }

  // 복습이 필요한 개념 조회
  async getConceptsDueForReview(): Promise<ForgettingCurveData[]> {
    try {
      const now = new Date().toISOString();
      const result = await database.executeSql(
        `SELECT fc.*, c.difficulty 
         FROM forgetting_curve_cache fc 
         JOIN concepts c ON fc.concept_id = c.id 
         WHERE fc.next_review_date <= ? 
         ORDER BY fc.next_review_date ASC`,
        [now],
      );

      const data: ForgettingCurveData[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        data.push({
          conceptId: row.concept_id,
          forgettingRate: row.forgetting_rate,
          nextReviewDate: new Date(row.next_review_date),
          priority: row.priority,
        });
      }

      return data;
    } catch (error) {
      console.error('Error getting concepts due for review:', error);
      return [];
    }
  }

  // 망각곡선 캐시 업데이트 (특정 개념)
  private async updateForgettingCurveCache(conceptId: string): Promise<void> {
    try {
      // 개념 정보 조회
      const conceptResult = await database.executeSql(
        'SELECT difficulty FROM concepts WHERE id = ?',
        [conceptId],
      );

      if (conceptResult.rows.length === 0) return;

      const difficulty = conceptResult.rows.item(0).difficulty;
      const studyRecords = await this.getStudyRecordsByConceptId(conceptId);

      // 망각곡선 데이터 계산
      const forgettingCurveData = generateForgettingCurveData(
        conceptId,
        studyRecords,
        difficulty,
      );

      // 캐시 업데이트
      await database.executeSql(
        `INSERT OR REPLACE INTO forgetting_curve_cache 
         (concept_id, forgetting_rate, next_review_date, priority, calculated_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          conceptId,
          forgettingCurveData.forgettingRate,
          forgettingCurveData.nextReviewDate.toISOString(),
          forgettingCurveData.priority,
          new Date().toISOString(),
        ],
      );
    } catch (error) {
      console.error('Error updating forgetting curve cache:', error);
    }
  }

  // 모든 망각곡선 캐시 업데이트 (배치 작업)
  async updateAllForgettingCurveCache(): Promise<void> {
    try {
      const conceptsResult = await database.executeSql(
        'SELECT id, difficulty FROM concepts',
      );

      for (let i = 0; i < conceptsResult.rows.length; i++) {
        const row = conceptsResult.rows.item(i);
        await this.updateForgettingCurveCache(row.id);
      }

      console.log('✅ All forgetting curve cache updated');
    } catch (error) {
      console.error('Error updating all forgetting curve cache:', error);
    }
  }

  // 연속 학습 일수 계산
  private async calculateStreakDays(): Promise<number> {
    try {
      const result = await database.executeSql(
        `SELECT DATE(studied_at) as study_date 
         FROM study_records 
         GROUP BY DATE(studied_at) 
         ORDER BY study_date DESC`,
      );

      if (result.rows.length === 0) return 0;

      let streakDays = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < result.rows.length; i++) {
        const studyDate = new Date(result.rows.item(i).study_date);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - streakDays);

        if (studyDate.getTime() === expectedDate.getTime()) {
          streakDays++;
        } else {
          break;
        }
      }

      return streakDays;
    } catch (error) {
      console.error('Error calculating streak days:', error);
      return 0;
    }
  }

  // 헬퍼 메서드
  private mapRowToStudyRecord(row: any): StudyRecord {
    return {
      id: row.id,
      conceptId: row.concept_id,
      studiedAt: new Date(row.studied_at),
      correctness: row.correctness,
      responseTime: row.response_time,
      reviewCount: row.review_count,
    };
  }
}

// 싱글톤 인스턴스
export const studyRecordService = new StudyRecordService();
