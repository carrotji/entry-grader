2. 5개 영역 30점 체계 채점 엔진 (src/utils/grader.ts)
기본 2점 + 세부 4개 조건(각 1점) = 영역별 6점 (총 5개 영역 = 30점 만점) 구조를 완벽 반영한 자동 채점 엔진입니다.
평가 영역
기본 점수
세부 평가 조건
영역 만점
 
1. 준비
2점
4개 조건 (각 1점)
6점
2. 시작 장면
2점
4개 조건 (각 1점)
6점
3. 벽돌
2점
4개 조건 (각 1점)
6점
4. 판
2점
4개 조건 (각 1점)
6점
5. 공
2점
4개 조건 (각 1점)
6점
합계
10점
20개 조건 (20점)
30점 만점

export interface SectionScore {
  name: string;
  baseScore: number;
  checks: boolean[];
  detailScore: number;
  totalScore: number;
  evidences: string[];
}

export interface GradingResult {
  studentId: string;
  studentName: string;
  sections: Record<string, SectionScore>;
  totalScore: number;
  status: 'UNGRADED' | 'REVIEWING' | 'CONFIRMED';
}

export function calculateSectionScore(checks: boolean[]): number {
  const baseScore = 2;
  const detailScore = checks.filter(Boolean).length;
  return Math.min(6, baseScore + detailScore);
}

export function gradeEntryProject(projectData: any): Record<string, SectionScore> {
  const sections: Record<string, SectionScore> = {
    준비: { name: '준비', baseScore: 2, checks: [false, false, false, false], detailScore: 0, totalScore: 2, evidences: [] },
    시작장면: { name: '시작 장면', baseScore: 2, checks: [false, false, false, false], detailScore: 0, totalScore: 2, evidences: [] },
    벽돌: { name: '벽돌', baseScore: 2, checks: [false, false, false, false], detailScore: 0, totalScore: 2, evidences: [] },
    판: { name: '판', baseScore: 2, checks: [false, false, false, false], detailScore: 0, totalScore: 2, evidences: [] },
    공: { name: '공', baseScore: 2, checks: [false, false, false, false], detailScore: 0, totalScore: 2, evidences: [] },
  };

  Object.keys(sections).forEach((key) => {
    const detailCount = sections[key].checks.filter(Boolean).length;
    sections[key].detailScore = detailCount;
    sections[key].totalScore = calculateSectionScore(sections[key].checks);
  });

  return sections;
}

