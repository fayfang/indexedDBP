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

export interface DBCONTAINER {
  [prop: string]: {
    insert: (document: any, key?: any) => Promise<unknown>,
    update: (query: any, data: any, options: UpdateOptions) => Promise<unknown>,
    remove: (query: any) => Promise<unknown>,
    clear: () => Promise<unknown>,
    find: (query: any, indexName?: string) => Promise<unknown>,
    count: (query?: QueryOptions) => Promise<unknown>,
    createIndex: (indexName: string, keyPath: string, objectParameters: IDBIndexParameters) => Promise<boolean>,
    deleteIndex: (indexName: string) => Promise<boolean>,
    containIndex: (name: string, indexName: string) => Promise<unknown>,
  };
}

export type transactionType = 'readonly' | 'readwrite' | 'versionchange' | undefined;
