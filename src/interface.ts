export interface ObjectStoreOptions {
  autoIncrement?: boolean;
  keyPath?: string;
}

export interface QueryOptions {
  value?: any;
  count?: number;
  $lt?: any;
  $lte?: any;
  $gte?: any;
  $gt?: any;
}

export interface UpdateOptions {
  extend?: boolean;
  multi?: boolean;
  upsert?: boolean;
}

export interface IndexedDBPOptions {
  name: string;
  version?: number;
  onError?: any;
  onSuccess?: any;
}

export type transactionType = 'readonly' | 'readwrite' | 'versionchange' | undefined;
