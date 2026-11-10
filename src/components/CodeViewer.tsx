엔트리 프로그래밍 자동 채점 도우미 — 핵심 코드 패치 모듈
본 문서에는 사용자 요청사항(매개변수 JSON 노출 버그 수정 및 엔트리 블록 UI 시각화, 명렬표 인코딩 대응, 5개 영역 30점 체계 채점 엔진 반영)을 완성한 핵심 React/TypeScript 소스 코드가 정리되어 있습니다.
1. 엔트리 블록 시각화 & JSON 노출 해결 (src/components/CodeViewer.tsx)
기존 JSON 객체({"id":"w9vq","params":["1"]})가 텍스트로 노출되는 현상을 보완하고, 엔트리 블록 카테고리 색상 뱃지 및 매개변수 알약 태그 스타일을 적용했습니다.
import React from 'react';

interface BlockParam {
  type?: string;
  params?: any[];
  [key: string]: any;
}

interface BlockData {
  id: string;
  type: string;
  name?: string;
  category?: string;
  params?: any[];
  statements?: any[];
}

function formatParamValue(param: any): string {
  if (param === null || param === undefined) return '';
  if (typeof param === 'object') {
    if (param.params && Array.isArray(param.params) && param.params.length > 0) {
      return formatParamValue(param.params[0]);
    }
    if (param.type) return String(param.type);
    return '';
  }
  if (typeof param === 'string' && param.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(param);
      return formatParamValue(parsed);
    } catch {
      return param;
    }
  }
  return String(param);
}

function getCategoryColor(category?: string): string {
  switch (category) {
    case '시작': return 'bg-emerald-500 text-white';
    case '흐름': return 'bg-amber-500 text-white';
    case '움직임': return 'bg-sky-500 text-white';
    case '생김새': return 'bg-purple-500 text-white';
    case '붓': return 'bg-red-400 text-white';
    case '소리': return 'bg-yellow-500 text-white';
    case '판단': return 'bg-teal-500 text-white';
    case '계산': return 'bg-blue-600 text-white';
    case '변수': return 'bg-indigo-500 text-white';
    case '기타': return 'bg-slate-500 text-white';
    default: return 'bg-blue-500 text-white';
  }
}

export const CodeViewer: React.FC<{ blocks: BlockData[] }> = ({ blocks }) => {
  return (
    <div className="space-y-2 p-4 bg-slate-100 rounded-xl border border-slate-200">
      {blocks.map((block, idx) => {
        const categoryClass = getCategoryColor(block.category);
        return (
          <div key={block.id || idx} className="flex flex-wrap items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm font-sans text-sm">
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${categoryClass}`}>
              {block.category || '기본'}
            </span>
            <span className="font-semibold text-slate-800">{block.name || block.type}</span>

            {block.params && block.params.length > 0 && (
              <div className="flex items-center gap-1.5 ml-1">
                {block.params.map((param, pIdx) => {
                  const cleanVal = formatParamValue(param);
                  if (!cleanVal) return null;
                  return (
                    <span key={pIdx} className="px-2.5 py-0.5 bg-sky-50 border border-sky-300 rounded-full text-xs text-sky-800 font-bold shadow-2xs">
                      {cleanVal}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};


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


3. 명렬표 한글 인코딩 및 필드 매핑 보완 (src/utils/rosterImport.ts)
한글 CSV 파일(EUC-KR/UTF-8)과 엑셀(.xlsx) 파일 업로드 시 학번, 이름 매핑 오류가 발생하지 않도록 유연한 키 감지 파서를 적용했습니다.
export interface StudentRecord {
  id: string;
  number: string;
  name: string;
}

export function normalizeHeader(header: string): string {
  const h = header.trim().toLowerCase();
  if (h.includes('학번') || h.includes('id') || h.includes('번호')) return 'number';
  if (h.includes('이름') || h.includes('성명') || h.includes('name')) return 'name';
  return h;
}


