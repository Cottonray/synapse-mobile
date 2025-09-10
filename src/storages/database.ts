import SQLite from 'react-native-sqlite-storage';

// SQLite 디버깅 및 Promise 모드 활성화
SQLite.DEBUG(false); // 프로덕션에서는 false로 설정
SQLite.enablePromise(true);

export interface DatabaseConfig {
  name: string;
  version: string;
  displayName: string;
  size: number;
}

const databaseConfig: DatabaseConfig = {
  name: 'SynapseDB.db',
  version: '1.0',
  displayName: 'Synapse Learning Database',
  size: 200000, // 200MB
};

class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    if (this.db) {
      return;
    }

    try {
      console.log('🔄 Initializing SQLite database...');

      // 더 간단한 방식으로 데이터베이스 열기
      this.db = await SQLite.openDatabase({
        name: databaseConfig.name,
        location: 'default',
      });

      console.log('✅ Database connection established');

      await this.createTables();
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('🔄 Creating database tables...');

    const tables = [
      // 개념 테이블
      `CREATE TABLE IF NOT EXISTS concepts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
        is_favorite INTEGER DEFAULT 0,
        color TEXT,
        priority INTEGER DEFAULT 3,
        estimated_study_time INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // 태그 테이블
      `CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        color TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // 개념-태그 관계 테이블
      `CREATE TABLE IF NOT EXISTS concept_tags (
        concept_id TEXT REFERENCES concepts(id) ON DELETE CASCADE,
        tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (concept_id, tag_id)
      )`,

      // 첨부파일 테이블
      `CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        concept_id TEXT REFERENCES concepts(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT CHECK(file_type IN ('image', 'video', 'audio', 'document')) NOT NULL,
        file_size INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // 학습 기록 테이블
      `CREATE TABLE IF NOT EXISTS study_records (
        id TEXT PRIMARY KEY,
        concept_id TEXT REFERENCES concepts(id) ON DELETE CASCADE,
        studied_at TEXT DEFAULT CURRENT_TIMESTAMP,
        correctness REAL CHECK(correctness >= 0 AND correctness <= 1) DEFAULT 0,
        response_time INTEGER DEFAULT 0,
        review_count INTEGER DEFAULT 1,
        study_type TEXT CHECK(study_type IN ('flashcard', 'quiz', 'review', 'practice')) DEFAULT 'review'
      )`,

      // 플립카드 테이블
      `CREATE TABLE IF NOT EXISTS flip_cards (
        id TEXT PRIMARY KEY,
        concept_id TEXT REFERENCES concepts(id) ON DELETE CASCADE,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        card_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // 망각곡선 캐시 테이블
      `CREATE TABLE IF NOT EXISTS forgetting_curve_cache (
        concept_id TEXT PRIMARY KEY REFERENCES concepts(id) ON DELETE CASCADE,
        forgetting_rate REAL DEFAULT 0,
        next_review_date TEXT,
        priority TEXT CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
        calculated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    // 인덱스 생성
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_concepts_category ON concepts(category)',
      'CREATE INDEX IF NOT EXISTS idx_concepts_difficulty ON concepts(difficulty)',
      'CREATE INDEX IF NOT EXISTS idx_concepts_is_favorite ON concepts(is_favorite)',
      'CREATE INDEX IF NOT EXISTS idx_concepts_created_at ON concepts(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_study_records_concept_id ON study_records(concept_id)',
      'CREATE INDEX IF NOT EXISTS idx_study_records_studied_at ON study_records(studied_at)',
      'CREATE INDEX IF NOT EXISTS idx_attachments_concept_id ON attachments(concept_id)',
      'CREATE INDEX IF NOT EXISTS idx_flip_cards_concept_id ON flip_cards(concept_id)',
    ];

    try {
      // 테이블 생성
      for (const tableSQL of tables) {
        console.log('🔄 Creating table...');
        await this.db.executeSql(tableSQL);
      }

      // 인덱스 생성
      for (const indexSQL of indexes) {
        console.log('🔄 Creating index...');
        await this.db.executeSql(indexSQL);
      }

      console.log('✅ All tables and indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      await this.initialize();
    }
    return this.db!;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('✅ Database closed');
    }
  }

  // 트랜잭션 헬퍼
  async transaction<T>(
    callback: (tx: SQLite.Transaction) => Promise<T>,
  ): Promise<T> {
    const db = await this.getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(
        async tx => {
          try {
            const result = await callback(tx);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        error => {
          console.error('Transaction error:', error);
          reject(error);
        },
      );
    });
  }

  // 쿼리 실행 헬퍼
  async executeSql(sql: string, params: any[] = []): Promise<SQLite.ResultSet> {
    const db = await this.getDatabase();
    const [result] = await db.executeSql(sql, params);
    return result;
  }

  // 데이터베이스 상태 확인
  async isReady(): Promise<boolean> {
    try {
      if (!this.db) return false;

      // 간단한 쿼리로 연결 상태 확인
      await this.db.executeSql('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database not ready:', error);
      return false;
    }
  }

  // 테스트 데이터 삽입 (개발용)
  async insertTestData(): Promise<void> {
    if (!(await this.isReady())) {
      throw new Error('Database is not ready');
    }

    try {
      console.log('🔄 Inserting test data...');

      const testConcepts = [
        {
          id: '1',
          title: 'React Native 기초',
          subtitle: '모바일 앱 개발의 시작',
          content:
            'React Native는 Facebook에서 개발한 오픈 소스 모바일 애플리케이션 프레임워크입니다.',
          category: '프로그래밍',
          difficulty: 'medium',
          priority: 4,
        },
        {
          id: '2',
          title: '에빙하우스 망각곡선',
          subtitle: '기억과 학습의 과학',
          content:
            '에빙하우스 망각곡선은 시간이 지남에 따라 기억이 어떻게 감소하는지를 보여주는 그래프입니다.',
          category: '심리학',
          difficulty: 'hard',
          priority: 5,
        },
      ];

      await this.transaction(async tx => {
        for (const concept of testConcepts) {
          await tx.executeSql(
            `INSERT OR REPLACE INTO concepts (
              id, title, subtitle, content, category, difficulty, priority, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
              concept.id,
              concept.title,
              concept.subtitle,
              concept.content,
              concept.category,
              concept.difficulty,
              concept.priority,
            ],
          );
        }
      });

      console.log('✅ Test data inserted successfully');
    } catch (error) {
      console.error('❌ Error inserting test data:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const database = new Database();

// 데이터베이스 초기화 함수
export const initializeDatabase = async (): Promise<void> => {
  try {
    await database.initialize();

    // 개발 환경에서 테스트 데이터 삽입
    if (__DEV__) {
      await database.insertTestData();
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};
