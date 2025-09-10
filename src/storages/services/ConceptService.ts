import { database } from '../database';
import { Concept, Attachment } from '../../types';
import { generateId } from '../../utils/helpers';

export interface CreateConceptData {
  title: string;
  subtitle?: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  color?: string;
  priority?: number;
  estimatedStudyTime?: number;
}

export interface UpdateConceptData extends Partial<CreateConceptData> {
  id: string;
}

export interface ConceptFilters {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  isFavorite?: boolean;
  tags?: string[];
  search?: string;
}

export class ConceptService {
  // 개념 생성
  async createConcept(data: CreateConceptData): Promise<Concept> {
    const conceptId = generateId();
    const now = new Date().toISOString();

    const concept: Concept = {
      id: conceptId,
      title: data.title,
      subtitle: data.subtitle,
      content: data.content,
      category: data.category,
      difficulty: data.difficulty,
      isFavorite: false,
      tags: data.tags,
      color: data.color,
      priority: data.priority || 3,
      estimatedStudyTime: data.estimatedStudyTime,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    await database.transaction(async tx => {
      // 개념 삽입
      await tx.executeSql(
        `INSERT INTO concepts (
          id, title, subtitle, content, category, difficulty, 
          color, priority, estimated_study_time, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          concept.id,
          concept.title,
          concept.subtitle || null,
          concept.content,
          concept.category,
          concept.difficulty,
          concept.color || null,
          concept.priority,
          concept.estimatedStudyTime || null,
          now,
          now,
        ],
      );

      // 태그 처리
      if (data.tags.length > 0) {
        await this.handleTags(tx, conceptId, data.tags);
      }
    });

    return concept;
  }

  // 개념 조회 (ID로)
  async getConceptById(id: string): Promise<Concept | null> {
    try {
      const result = await database.executeSql(
        'SELECT * FROM concepts WHERE id = ?',
        [id],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows.item(0);
      const concept = this.mapRowToConcept(row);

      // 태그 및 첨부파일 로드
      concept.tags = await this.getConceptTags(id);
      concept.attachments = await this.getConceptAttachments(id);

      return concept;
    } catch (error) {
      console.error('Error getting concept by ID:', error);
      throw error;
    }
  }

  // 모든 개념 조회
  async getAllConcepts(filters?: ConceptFilters): Promise<Concept[]> {
    try {
      let sql = 'SELECT * FROM concepts WHERE 1=1';
      const params: any[] = [];

      // 필터 적용
      if (filters?.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters?.difficulty) {
        sql += ' AND difficulty = ?';
        params.push(filters.difficulty);
      }

      if (filters?.isFavorite !== undefined) {
        sql += ' AND is_favorite = ?';
        params.push(filters.isFavorite ? 1 : 0);
      }

      if (filters?.search) {
        sql += ' AND (title LIKE ? OR content LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      sql += ' ORDER BY updated_at DESC';

      const result = await database.executeSql(sql, params);
      const concepts: Concept[] = [];

      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        const concept = this.mapRowToConcept(row);

        // 태그 로드
        concept.tags = await this.getConceptTags(concept.id);

        concepts.push(concept);
      }

      // 태그 필터링 (SQL에서 처리하기 복잡해서 후처리)
      if (filters?.tags && filters.tags.length > 0) {
        return concepts.filter(concept =>
          filters.tags!.some(tag => concept.tags.includes(tag)),
        );
      }

      return concepts;
    } catch (error) {
      console.error('Error getting all concepts:', error);
      throw error;
    }
  }

  // 즐겨찾기 개념 조회
  async getFavoriteConcepts(): Promise<Concept[]> {
    return this.getAllConcepts({ isFavorite: true });
  }

  // 개념 업데이트
  async updateConcept(data: UpdateConceptData): Promise<Concept> {
    const now = new Date().toISOString();

    await database.transaction(async tx => {
      // 기본 정보 업데이트
      const updateFields: string[] = [];
      const updateParams: any[] = [];

      if (data.title !== undefined) {
        updateFields.push('title = ?');
        updateParams.push(data.title);
      }
      if (data.subtitle !== undefined) {
        updateFields.push('subtitle = ?');
        updateParams.push(data.subtitle);
      }
      if (data.content !== undefined) {
        updateFields.push('content = ?');
        updateParams.push(data.content);
      }
      if (data.category !== undefined) {
        updateFields.push('category = ?');
        updateParams.push(data.category);
      }
      if (data.difficulty !== undefined) {
        updateFields.push('difficulty = ?');
        updateParams.push(data.difficulty);
      }
      if (data.color !== undefined) {
        updateFields.push('color = ?');
        updateParams.push(data.color);
      }
      if (data.priority !== undefined) {
        updateFields.push('priority = ?');
        updateParams.push(data.priority);
      }
      if (data.estimatedStudyTime !== undefined) {
        updateFields.push('estimated_study_time = ?');
        updateParams.push(data.estimatedStudyTime);
      }

      updateFields.push('updated_at = ?');
      updateParams.push(now);
      updateParams.push(data.id);

      if (updateFields.length > 1) {
        // updated_at 외에 다른 필드가 있을 때만
        const sql = `UPDATE concepts SET ${updateFields.join(
          ', ',
        )} WHERE id = ?`;
        await tx.executeSql(sql, updateParams);
      }

      // 태그 업데이트
      if (data.tags !== undefined) {
        // 기존 태그 관계 삭제
        await tx.executeSql('DELETE FROM concept_tags WHERE concept_id = ?', [
          data.id,
        ]);
        // 새 태그 추가
        if (data.tags.length > 0) {
          await this.handleTags(tx, data.id, data.tags);
        }
      }
    });

    const updatedConcept = await this.getConceptById(data.id);
    if (!updatedConcept) {
      throw new Error('Failed to retrieve updated concept');
    }

    return updatedConcept;
  }

  // 즐겨찾기 토글
  async toggleFavorite(id: string): Promise<boolean> {
    try {
      const concept = await this.getConceptById(id);
      if (!concept) {
        throw new Error('Concept not found');
      }

      const newFavoriteStatus = !concept.isFavorite;
      await database.executeSql(
        'UPDATE concepts SET is_favorite = ?, updated_at = ? WHERE id = ?',
        [newFavoriteStatus ? 1 : 0, new Date().toISOString(), id],
      );

      return newFavoriteStatus;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  // 개념 삭제
  async deleteConcept(id: string): Promise<void> {
    try {
      await database.transaction(async tx => {
        // 외래 키 제약으로 인해 관련 데이터들이 자동으로 삭제됨 (ON DELETE CASCADE)
        await tx.executeSql('DELETE FROM concepts WHERE id = ?', [id]);
      });
    } catch (error) {
      console.error('Error deleting concept:', error);
      throw error;
    }
  }

  // 카테고리 목록 조회
  async getCategories(): Promise<string[]> {
    try {
      const result = await database.executeSql(
        'SELECT DISTINCT category FROM concepts ORDER BY category',
      );

      const categories: string[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        categories.push(result.rows.item(i).category);
      }

      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // 개념 통계
  async getConceptStats(): Promise<{
    total: number;
    byDifficulty: Record<string, number>;
    byCategory: Record<string, number>;
    favorites: number;
  }> {
    try {
      // 전체 개수
      const totalResult = await database.executeSql(
        'SELECT COUNT(*) as count FROM concepts',
      );
      const total = totalResult.rows.item(0).count;

      // 난이도별 개수
      const difficultyResult = await database.executeSql(
        'SELECT difficulty, COUNT(*) as count FROM concepts GROUP BY difficulty',
      );
      const byDifficulty: Record<string, number> = {};
      for (let i = 0; i < difficultyResult.rows.length; i++) {
        const row = difficultyResult.rows.item(i);
        byDifficulty[row.difficulty] = row.count;
      }

      // 카테고리별 개수
      const categoryResult = await database.executeSql(
        'SELECT category, COUNT(*) as count FROM concepts GROUP BY category',
      );
      const byCategory: Record<string, number> = {};
      for (let i = 0; i < categoryResult.rows.length; i++) {
        const row = categoryResult.rows.item(i);
        byCategory[row.category] = row.count;
      }

      // 즐겨찾기 개수
      const favoritesResult = await database.executeSql(
        'SELECT COUNT(*) as count FROM concepts WHERE is_favorite = 1',
      );
      const favorites = favoritesResult.rows.item(0).count;

      return {
        total,
        byDifficulty,
        byCategory,
        favorites,
      };
    } catch (error) {
      console.error('Error getting concept stats:', error);
      throw error;
    }
  }

  // 헬퍼 메서드들
  private mapRowToConcept(row: any): Concept {
    return {
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      content: row.content,
      category: row.category,
      difficulty: row.difficulty,
      isFavorite: Boolean(row.is_favorite),
      tags: [], // 별도로 로드
      color: row.color,
      priority: row.priority,
      estimatedStudyTime: row.estimated_study_time,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private async handleTags(
    tx: any,
    conceptId: string,
    tags: string[],
  ): Promise<void> {
    for (const tagName of tags) {
      // 태그가 존재하지 않으면 생성
      const tagId = generateId();
      await tx.executeSql(
        'INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)',
        [tagId, tagName],
      );

      // 태그 ID 조회
      const tagResult = await tx.executeSql(
        'SELECT id FROM tags WHERE name = ?',
        [tagName],
      );
      const actualTagId = tagResult.rows.item(0).id;

      // 개념-태그 관계 생성
      await tx.executeSql(
        'INSERT OR IGNORE INTO concept_tags (concept_id, tag_id) VALUES (?, ?)',
        [conceptId, actualTagId],
      );
    }
  }

  private async getConceptTags(conceptId: string): Promise<string[]> {
    try {
      const result = await database.executeSql(
        `SELECT t.name FROM tags t 
         JOIN concept_tags ct ON t.id = ct.tag_id 
         WHERE ct.concept_id = ?`,
        [conceptId],
      );

      const tags: string[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        tags.push(result.rows.item(i).name);
      }

      return tags;
    } catch (error) {
      console.error('Error getting concept tags:', error);
      return [];
    }
  }

  private async getConceptAttachments(
    conceptId: string,
  ): Promise<Attachment[]> {
    try {
      const result = await database.executeSql(
        'SELECT * FROM attachments WHERE concept_id = ? ORDER BY created_at',
        [conceptId],
      );

      const attachments: Attachment[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        attachments.push({
          id: row.id,
          conceptId: row.concept_id,
          fileName: row.file_name,
          filePath: row.file_path,
          fileType: row.file_type,
          fileSize: row.file_size,
          createdAt: new Date(row.created_at),
        });
      }

      return attachments;
    } catch (error) {
      console.error('Error getting concept attachments:', error);
      return [];
    }
  }
}

// 싱글톤 인스턴스
export const conceptService = new ConceptService();
