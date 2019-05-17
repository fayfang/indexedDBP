/*
 * 说明：
 * 封装indexDB成类mongo风格的API，提供方便的结构化调用
 */
import {IndexDBPOptions, ObjectStoreOptions, UpdateOptions, transactionType, QueryOptions} from './interface';
import {hasVersionError, parseQueryToIDBKeyRange, getIndex} from './tools';

const DefaultIndexDBPOptions: IndexDBPOptions = {
  name: 'indexDbP',
  version: 1,
  onError(error: any) {
    throw error;
  },
  onSuccess() {

  },
};
const DefaultObjectStoreOptions: ObjectStoreOptions = {
  autoIncrement: true,
  keyPath: 'id',
};
const DefaultUpdateConfig = {
  upsert: false,
  multi: false,
  extend: true,
};

const IndexDB = window.indexedDB;

class IndexDBP {
  get db() {
    return this.pdb;
  }
  set db(val: IDBDatabase) {
    this.pdb = val;
    const names = val.objectStoreNames;
    for (let i = 0; i < names.length; i++) {
      this.insertObjectStore(names[i]);
    }
  }
  public $db: any = {};
  public name!: string;
  public version?: number;
  private pdb!: any;
  private openRequest!: IDBOpenDBRequest;
  private versionTransaction!: IDBTransaction;
  private onError!: any;
  private onSuccess!: any;
  constructor(options: IndexDBPOptions = DefaultIndexDBPOptions) {
    this.name = options.name;
    this.version = options.version;
    this.onError = options.onError || DefaultIndexDBPOptions.onError;
    this.onSuccess = options.onSuccess || DefaultIndexDBPOptions.onSuccess;
  }
  public init() {
    return this.use(this.name, this.version);
  }
  public getTransaction(name: string, type: transactionType): IDBTransaction {
    return this.db.transaction(name, type);
  }
  public getObjectStore(name: string, type: transactionType): IDBObjectStore {
    const transaction = this.getTransaction(name, type);
    return transaction.objectStore(name);
  }
  /**
   * delete Database
   * @param {none} .
   * @returns {IDBVersionChangeEvent}
   */
  public dropDatabase() {
    const dropPromise = new Promise((resolve, reject) => {
      if (IndexDB.deleteDatabase && this.db) {
        const name = this.db.name;
        this.closeDB();

        const deleteRequest = IndexDB.deleteDatabase(name);
        deleteRequest.onsuccess = (event) => {
          resolve(event);
        };
        deleteRequest.onerror = (error) => {
          reject(this.patchError(error));
        };
      } else {
        reject(this.patchError('Browser does not support IndexedDB deleteDatabase!'));
      }
    });

    return dropPromise;
  }
  /**
   * if contain objectStore
   * @param {string} Name objectStore Name
   * @returns {Boolean}
   */
  public containObjectStore(name: string) {
    const storeNames = this.db.objectStoreNames;
    return getIndex(storeNames, name) > -1;
  }
  /**
   * create objectStore
   * @param {string} Name objectStore Name
   * @param {object} options objectStore options
   * @returns {IDBObjectStore}
   */
  public async createObjectStore(name: string, options: ObjectStoreOptions = DefaultObjectStoreOptions) {
    if (this.containObjectStore(name)) {
      return this.patchError(`objectStore: ${name} exist`);
    }

    await this.toggleMode('versionChange');

    const objectStore = this.db.createObjectStore(name, options);

    this.insertObjectStore(name);
    return objectStore;
  }
  /**
   * delete objectStore
   * @param {string} Name objectStore Name
   * @returns {Boolean}
   */
  public async deleteObjectStore(name: string) {
    if (!this.containObjectStore(name)) {
      return this.patchError(`objectStore: ${name} not exist`);
    }

    await this.toggleMode('versionChange');

    this.db.deleteObjectStore(name);
    return true;
  }
  /**
   * contain index
   * @param {string} indexName inedex Name
   * @returns {Boolean}
   */
  public containIndex(name: string, indexName: string) {
    let transaction;
    if (this.versionTransaction) {
      transaction = this.versionTransaction;
    } else {
      transaction = this.getTransaction(name, 'readonly');
    }
    const objectStore = transaction.objectStore(name);
    return getIndex(objectStore.indexNames, indexName) > -1;
  }
  /**
   * create index
   * @param {string} Name objectStore Name
   * @param {string} indexName index name
   * @param {string} keyPath keyPath
   * @param {object} objectParameters params
   * @returns {Boolean}
   */
  public async createIndex(name: string, indexName: string, keyPath: string, objectParameters: IDBIndexParameters) {
    await this.toggleMode('versionChange');
    const objectStore = this.versionTransaction.objectStore(name);
    objectStore.createIndex(indexName, keyPath, objectParameters);
    return true;
  }
  /**
   * delete index
   * @param {string} Name objectStore Name
   * @param {string} indexName index name
   * @returns {Boolean}
   */
  public async deleteIndex(name: string, indexName: string) {
    await this.toggleMode('versionChange');
    const objectStore = this.versionTransaction.objectStore(name);
    objectStore.deleteIndex(indexName);
    return true;
  }
  /**
   * Object​Store Operaion
   * 集合的增删改查
   */
  /**
   * count document
   * @param {string} name
   * @param {object | string} query the query params to find document
   */
  public async count(name: string, query?: QueryOptions) {
    await this.toggleMode('normal');

    const countPromise = new Promise((resolve, reject) => {
      const objectStore = this.getObjectStore(name, 'readonly');
      let req: any;
      if (query) {
        const params = parseQueryToIDBKeyRange(query);
        req = objectStore.count(params);
      } else {
        req = objectStore.count();
      }

      this.documentHandleError(req, reject, 'count IDBRequest unknown error');

      req.onsuccess = () => {
        resolve(req.result);
      };
    });

    return countPromise;
  }
  /**
   * find document
   * @param {string} name
   * @param {object | string} query the query params to find document
   * @param {string} indexName search by index
   */
  public async find(name: string, query: any, indexName?: string) {
    const isQueryPureObject = Object.prototype.toString.call(query) === '[object Object]';

    await this.toggleMode('normal');

    const findPromise = new Promise((resolve, reject) => {
      const objectStore = this.getObjectStore(name, 'readonly');

      let req: any;
      let getObj: IDBObjectStore | IDBIndex = objectStore;
      if (indexName) {
        const index: IDBIndex = objectStore.index(indexName);
        getObj = index;
      }

      if (isQueryPureObject) {
        const params = parseQueryToIDBKeyRange(query);
        req = getObj.getAll(params, query.count);
      } else {
        req = getObj.getAll(query);
      }

      this.documentHandleError(req, reject, 'find IDBRequest unknown error');

      req.onsuccess = () => {
        resolve(req.result);
      };
    });

    return findPromise;
  }
  /**
   * insert document
   * @param {string} name
   * @param {object} document
   * @param {object} options
   */
  public async insert(name: string, document: any, key: any) {
    await this.toggleMode('normal');

    const inertPromise = new Promise((resolve, reject) => {
      const objectStore = this.getObjectStore(name, 'readwrite');
      const req = objectStore.add(document, key);

      this.documentHandleError(req, reject, 'add IDBRequest unknown error');

      req.onsuccess = (event) => {
        resolve(event);
      };
    });

    return inertPromise;
  }
  /**
   * update document
   * @param {string} name
   * @param {object | string} query the query params to find document
   * @param {object} data update data
   * @param {object} options as DefaultUpdateConfig
   */
  public async update(name: string, query: any, data: any, options: UpdateOptions) {
    options = Object.assign({}, DefaultUpdateConfig, options);

    await this.toggleMode('normal');

    const findResult = await this.find(name, query) as any[];
    // if (!result && !options.upsert) return reject(patchError.call(this, 'can not find result!'));
    const UpdateFn = (result: any = {}) => {
      const updatePromise = new Promise((resolve, reject) => {
        const objectStore = this.getObjectStore(name, 'readwrite');
        let key = '';

        if (typeof objectStore.keyPath === 'string') {
          key = objectStore.keyPath;
        } else {
          key = objectStore.keyPath[0];
        }

        if (result[key]) {
          data[key] = result[key];
        }

        if (options.extend) {
          data = Object.assign(result, data);
        }

        const req = objectStore.put(data);

        this.documentHandleError(req, reject, 'update IDBRequest unknown error');

        req.onsuccess = (event) => {
          resolve(event);
        };
      });

      return updatePromise;
    };

    if (options.multi) {
      return Promise.all(findResult.map((result: any) => UpdateFn(result)));
    } else {
      const length = findResult.length;
      if (!length && !options.upsert) { return this.patchError('can not find result!'); }
      return UpdateFn(findResult[0] || {});
    }
  }
  /**
   * remove document
   * @param {string} name
   * @param {object | string} query the query params to find document
   */
  public async remove(name: string, query: any) {
    const isQueryPureObject = Object.prototype.toString.call(query) === '[object Object]';

    await this.toggleMode('normal');

    const removePromise = new Promise((resolve, reject) => {
      const objectStore = this.getObjectStore(name, 'readwrite');

      let params = query;
      if (isQueryPureObject) {
        params = parseQueryToIDBKeyRange(query);
      }

      const req = objectStore.delete(params);

      this.documentHandleError(req, reject, 'remove IDBRequest unknown error');

      req.onsuccess = (event) => {
        resolve(event);
      };
    });

    return removePromise;
  }
  /**
   * select Database
   * @param {string} dbName db's name
   * @param {string} dbVersion db's version
   * @returns {Boolean}
   */
  private use(dbName: string, dbVersion?: number) {
    const dbPromise = new Promise((resolve, reject) => {
      const openRequest = IndexDB.open(dbName, dbVersion);
      this.openRequest = openRequest;

      openRequest.onerror = (errorEvent: any) => {
        if (hasVersionError(errorEvent)) {
          reject(this.patchError('The version number provided is lower than the existing one.'));
        } else {
          let error;
          if (errorEvent.target.error) {
            error = errorEvent.target.error;
            error = error.message || error;
          } else {
            let errorMessage = `unknown error: ${dbName}:${dbVersion} open fail`;
            if ('errorCode' in errorEvent.target) {
              errorMessage += ' with error code ' + errorEvent.target.errorCode;
            }
            error = new Error(errorMessage);
          }

          reject(this.patchError(error));
        }
      };
      openRequest.onblocked = (event) => {
        console.log(event);
        reject(this.patchError('the db is blocked'));
      };
      openRequest.onsuccess = (event: any) => {
        this.db = event.target.result;
        if (this.onSuccess) { this.onSuccess(event); }

        resolve(true);
      };
      openRequest.onupgradeneeded = (event: any) => {
        // event instanceof IDBVersionChangeEvent === true
        this.db = event.target.result;
        this.versionTransaction = event.target.transaction;
        if (this.onSuccess) { this.onSuccess(event); }

        resolve(true);
      };
    });

    return dbPromise;
  }
  private insertObjectStore(name: string) {
    this.$db[name] = {
      insert: this.insert.bind(this, name),
      update: this.update.bind(this, name),
      remove: this.remove.bind(this, name),
      find: this.find.bind(this, name),
      count: this.count.bind(this, name),
      createIndex: this.createIndex.bind(this, name),
      deleteIndex: this.deleteIndex.bind(this, name),
      containIndex: this.containIndex.bind(this, name),
    };
  }

  private patchError(arg: any) {
    let error;
    if (arg instanceof Error) {
      error = arg;
    } else {
      error = new Error(arg);
    }
    this.onError(error);
    return error;
  }

  private closeDB() {
    this.db.close();
    this.openRequest.onerror = null;
    this.openRequest.onsuccess = null;
    this.openRequest.onupgradeneeded = null;
  }

  private toggleMode(mode: 'normal' | 'versionChange') {
    const Toggle = async (change: boolean) => {
      const name = this.db.name;
      const version = change ? this.db.version + 1 : this.db.version;
      this.closeDB();
      await this.use(name, version);
    };

    if (mode === 'versionChange') {
      if (!this.versionTransaction) {
        return Toggle(true);
      } else {
        return Promise.resolve(true);
      }
    }

    if (mode === 'normal') {
      if (this.versionTransaction) {
        return Toggle(false);
      } else {
        return Promise.resolve(true);
      }
    }
  }
  private documentHandleError(req: IDBRequest, reject: any, msg: any) {
    req.onerror = (errorEvent: any) => {
      const error = errorEvent.target.error;
      reject(this.patchError(error.message || msg));
    };
  }
}

export default IndexDBP;
