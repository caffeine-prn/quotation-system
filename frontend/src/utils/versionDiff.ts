import { Version, VersionChange } from '../types/version';

type DeepObject = { [key: string]: any };

const compareObjects = (obj1: DeepObject, obj2: DeepObject, path = ''): VersionChange[] => {
  const changes: VersionChange[] = [];

  // 모든 키를 가져옴 (obj1과 obj2의 모든 키를 포함)
  const allKeys = Array.from(new Set([...Object.keys(obj1), ...Object.keys(obj2)]));

  allKeys.forEach(key => {
    const currentPath = path ? `${path}.${key}` : key;
    const value1 = obj1[key];
    const value2 = obj2[key];

    // 두 값의 타입이 다르면 변경으로 처리
    if (typeof value1 !== typeof value2) {
      changes.push({
        field: currentPath,
        oldValue: value1,
        newValue: value2,
      });
      return;
    }

    // 객체인 경우 재귀적으로 비교
    if (typeof value1 === 'object' && value1 !== null && !Array.isArray(value1)) {
      changes.push(...compareObjects(value1, value2, currentPath));
      return;
    }

    // 배열인 경우
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (JSON.stringify(value1) !== JSON.stringify(value2)) {
        changes.push({
          field: currentPath,
          oldValue: value1,
          newValue: value2,
        });
      }
      return;
    }

    // 기본값 비교
    if (value1 !== value2) {
      changes.push({
        field: currentPath,
        oldValue: value1,
        newValue: value2,
      });
    }
  });

  return changes;
};

export const getVersionDiff = (version1: Version, version2: Version): VersionChange[] => {
  // 버전의 실제 데이터를 가져오는 API 호출이 필요할 수 있음
  return version1.changes;
};

export const formatFieldName = (field: string): string => {
  const fieldMappings: { [key: string]: string } = {
    'quoteNumber': '견적서 번호',
    'date': '작성일',
    'validUntil': '유효기간',
    'customer': '고객사',
    'projectDescription': '프로젝트 설명',
    'status': '상태',
    'items': '견적 항목',
    'totalAmount': '총액',
    'name': '이름',
    'unitPrice': '단가',
    'quantity': '수량',
    'discount': '할인율',
  };

  const parts = field.split('.');
  return parts.map(part => fieldMappings[part] || part).join(' > ');
};

export const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '-';
  }

  if (Array.isArray(value)) {
    return `[${value.length}개 항목]`;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  if (typeof value === 'boolean') {
    return value ? '예' : '아니오';
  }

  return String(value);
};