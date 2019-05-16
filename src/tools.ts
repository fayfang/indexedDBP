import {QueryOptions} from './interface';

export function hasVersionError(errorEvent: any) {
  if ('error' in errorEvent.target) {
      return errorEvent.target.error.name === 'VersionError';
  } else if ('errorCode' in errorEvent.target) {
      return errorEvent.target.errorCode === 12;
  }
  return false;
}

export function parseQueryToIDBKeyRange(query: QueryOptions) {
  const keys = Object.keys(query);
  const Islt = keys.indexOf('$lt') > -1 || keys.indexOf('$lte') > -1;
  const Isgt = keys.indexOf('$gt') > -1 || keys.indexOf('$gte') > -1;

  if (Islt && Isgt) {
    return IDBKeyRange.bound(query.$gt || query.$gte, query.$lt || query.$lte, !!query.$gt, !!query.$lt);
  } else if (Isgt) {
    return IDBKeyRange.lowerBound(query.$gt || query.$gte, !!query.$gt);
  } else if (Islt) {
    return IDBKeyRange.upperBound(query.$lt || query.$lte, query.$lt);
  } else {
    return query.value || '';
  }
}

export function getIndex(names: any, name: string) {
  let index = -1;
  for (let i = 0; i < names.length; i++) {
    if (names[i] === name) { index = i; }
  }
  return index;
}
