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

