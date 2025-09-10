# 📚 에빙하우스 망각곡선 앱을 위한 저장소 솔루션 비교

## 🎯 우리 앱의 데이터 특성
- **학습 기록**: 지속적으로 증가하는 시계열 데이터
- **개념 정보**: 텍스트, 이미지, 태그 등 다양한 형태
- **망각곡선 계산**: 복잡한 쿼리와 집계 필요
- **오프라인 우선**: 네트워크 없이도 동작해야 함

## 💾 저장소 옵션별 비교

### 1. AsyncStorage (현재 사용)
```typescript
// 장점
✅ 간단한 구현
✅ React Native 기본 지원
✅ 작은 설정 데이터에 적합

// 단점
❌ 6MB 용량 제한
❌ 복잡한 쿼리 불가
❌ 성능 이슈 (대용량 데이터)
❌ 관계형 데이터 처리 어려움
```

### 2. SQLite (추천 ⭐)
```typescript
// 라이브러리: react-native-sqlite-storage 또는 expo-sqlite
// 장점
✅ 관계형 데이터베이스
✅ 복잡한 쿼리 지원 (JOIN, GROUP BY 등)
✅ 인덱싱으로 빠른 검색
✅ 트랜잭션 지원
✅ 수 GB 데이터 처리 가능
✅ 망각곡선 계산에 최적

// 단점
❌ 초기 설정 복잡
❌ SQL 지식 필요
❌ 마이그레이션 관리 필요
```

### 3. Realm Database
```typescript
// 장점
✅ 객체 지향 데이터베이스
✅ 자동 스키마 마이그레이션
✅ 실시간 데이터 동기화
✅ 뛰어난 성능
✅ TypeScript 친화적

// 단점
❌ 큰 번들 사이즈
❌ 학습 곡선
❌ MongoDB Atlas 의존성 (클라우드)
```

### 4. WatermelonDB
```typescript
// 장점
✅ React Native 최적화
✅ 지연 로딩
✅ 관찰 가능한 쿼리
✅ 좋은 성능
✅ SQLite 기반

// 단점
❌ 상대적으로 새로운 라이브러리
❌ 복잡한 설정
❌ 문서 부족
```

### 5. MMKV (고성능 키-값 저장소)
```typescript
// 장점
✅ AsyncStorage보다 10배 빠름
✅ 용량 제한 없음
✅ 암호화 지원
✅ 간단한 API

// 단점
❌ 키-값 저장소 (복잡한 쿼리 불가)
❌ 관계형 데이터 처리 어려움
```

## 🎯 에빙하우스 앱을 위한 추천 솔루션

### 📋 1단계: 하이브리드 접근법 (추천)
```typescript
// 설정 데이터: MMKV
- 테마, 언어 설정
- 사용자 기본 설정

// 학습 데이터: SQLite
- 개념 정보 (concepts)
- 학습 기록 (study_records)
- 플립카드 (flip_cards)
- 망각곡선 데이터 (forgetting_curve_data)
```

### 📋 2단계: SQLite 스키마 설계
```sql
-- 개념 테이블
CREATE TABLE concepts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
    is_favorite BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 학습 기록 테이블
CREATE TABLE study_records (
    id TEXT PRIMARY KEY,
    concept_id TEXT REFERENCES concepts(id),
    studied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    correctness REAL CHECK(correctness >= 0 AND correctness <= 1),
    response_time INTEGER,
    review_count INTEGER DEFAULT 1
);

-- 망각곡선 데이터 (캐시)
CREATE TABLE forgetting_curve_cache (
    concept_id TEXT PRIMARY KEY REFERENCES concepts(id),
    forgetting_rate REAL,
    next_review_date DATETIME,
    priority TEXT CHECK(priority IN ('high', 'medium', 'low')),
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_study_records_concept_id ON study_records(concept_id);
CREATE INDEX idx_study_records_studied_at ON study_records(studied_at);
CREATE INDEX idx_concepts_category ON concepts(category);
CREATE INDEX idx_concepts_is_favorite ON concepts(is_favorite);
```

### 📋 3단계: 성능 최적화 전략
```typescript
// 1. 배치 처리
const saveBatchStudyRecords = async (records: StudyRecord[]) => {
  await db.transaction(tx => {
    records.forEach(record => {
      tx.executeSql(INSERT_STUDY_RECORD_SQL, [record.id, ...]);
    });
  });
};

// 2. 망각곡선 데이터 캐싱
const updateForgettingCurveCache = async () => {
  // 매일 또는 주기적으로 계산된 데이터 캐시
  const concepts = await getAllConcepts();
  const cacheData = concepts.map(concept => 
    calculateForgettingCurveData(concept)
  );
  await saveForgettingCurveCache(cacheData);
};

// 3. 페이징 처리
const getStudyRecords = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return await db.executeSql(
    'SELECT * FROM study_records ORDER BY studied_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
};
```

## 🚀 마이그레이션 계획

### Phase 1: MMKV 도입 (빠른 개선)
- AsyncStorage → MMKV 교체
- 설정 데이터만 먼저 이전
- 성능 개선 체감

### Phase 2: SQLite 도입 (완전한 해결)
- 학습 데이터 구조 설계
- 데이터 마이그레이션 도구 개발
- 망각곡선 계산 최적화

### Phase 3: 고도화
- 백그라운드 동기화
- 데이터 백업/복원
- 분석 기능 강화
