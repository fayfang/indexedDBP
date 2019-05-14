/*
 * 说明：
 * 封装indexDB成类mongo风格的API，提供方便的结构化调用
 */

const ErrorHandler = function (error) {
  throw error;
};

const DefaultConfigs = {
  onError: ErrorHandler,
};
const DefaultObjectStoreConfig = {
  autoIncrement: true,
  keyPath: 'id'
};
const DefaultUpdateConfig = {
  upsert: false,
  multi: false,
  extend: true
}

const BasicInfo = {
  version: '0.1.0',
  description: 'nothing to say'
};

const browserPrefix = ['webkit', 'moz', 'ms', 'shim'];

function getIndexDB () {
  let IdbToUse = window.indexedDB;

  if (!IdbToUse) {
    browserPrefix.forEach(item => {
      let idb = window[item + 'IndexedDB'];
      idb && (IdbToUse = idb);
    });
  };

  return IdbToUse;
};

const IndexDB = getIndexDB(); // indexDB
const constantKeys = {
  'READ_ONLY': 'readonly',
  'READ_WRITE': 'readwrite',
  'VERSION_CHANGE': 'versionchange',
  'NEXT': 'next',
  'NEXT_NO_DUPLICATE': 'nextunique',
  'PREV': 'prev',
  'PREV_NO_DUPLICATE': 'prevunique'
};

function defineDB (ins) {
  clearCollection(ins)
  let db = null
  Object.defineProperty(ins, 'db', {
    get () {
      if (db === null) {
        throw new Error('db is not used, use(DBName) before any operaion')
      }
      return db
    },
    set (val) {
      db = val
      if (val !== null) {
        let names = db.objectStoreNames
        for (let i = 0; i < names.length; i++) {
          insertCollection(ins, names[i])
        }
      } else {
        clearCollection(ins)
      }
    }
  })
}

function insertCollection(ins, name) {
  ins.$db[name] = {
    insert: ins.insert.bind(ins, name),
    update: ins.update.bind(ins, name),
    remove: ins.remove.bind(ins, name),
    find: ins.find.bind(ins, name),
    createIndex: ins.createIndex.bind(ins, name),
    deleteIndex: ins.deleteIndex.bind(ins, name),
    containIndex: ins.containIndex.bind(ins, name),
  }
}
function clearCollection(ins) {
  ins.$db = {}
}

class indexDBP {
  constructor (configs = {}) {
    for (let key in DefaultConfigs) {
      this[key] = typeof configs[key] !== 'undefined' ? configs[key] : DefaultConfigs[key];
    }

    this.Version = BasicInfo.version;
    /*
     * watch db change
     */
    defineDB(this);
    this.isVersionChange = false;
    this.openRequest = null
    this.versionTransaction = null
  }
  getTransaction (name, type) {
    return this.db.transaction(name, type)
  }
  getObjectStore (name, type) {
    let transaction = this.getTransaction(name, type);
    return transaction.objectStore(name);
  }
  /**
   * delete Database
   * @param {string} dbName db's name
   * @param {string} dbVersion db's version
   * @returns {Boolean}
   */
  use (dbName, dbVersion) {
    const dbPromise = new Promise((resolve, reject) => {
      let openRequest = IndexDB.open(dbName, dbVersion);
      this.openRequest = openRequest

      openRequest.onerror = (errorEvent) => {
        this.db = null
        this.isVersionChange = false;
        this.versionTransaction = null;
        if (hasVersionError(errorEvent)) {
          reject(patchError.call(this, 'The version number provided is lower than the existing one.'));
        } else {
          let error;
          if (errorEvent.target.error) {
            error = errorEvent.target.error;
            error = error.message || error
          } else {
            let errorMessage = 'IndexedDB unknown error occurred when opening DB ' + this.dbName + ' version ' + this.dbVersion;
            if ('errorCode' in errorEvent.target) {
              errorMessage += ' with error code ' + errorEvent.target.errorCode;
            }
            error = new Error(errorMessage);
          }

          reject(patchError.call(this, error));
        }
      }
      openRequest.onsuccess = (event) => {
        this.db = event.target.result;
        this.isVersionChange = false;
        this.versionTransaction = null;

        resolve(true);
      }
      openRequest.onupgradeneeded = (event) => {
        // event instanceof IDBVersionChangeEvent === true
        this.db = event.target.result;
        this.isVersionChange = true;
        this.versionTransaction = event.target.transaction;

        resolve(true);
      }
    })

    return dbPromise;
  }
  /**
   * delete Database
   * @param {none} .
   * @returns {IDBVersionChangeEvent}
   */
  dropDatabase () {
    const dropPromise = new Promise((resolve, reject) => {
      if (IndexDB.deleteDatabase) {
        let name = this.db.name;
        closeDB.call(this);

        var deleteRequest = IndexDB.deleteDatabase(name);
        deleteRequest.onsuccess = (event) => {
          resolve(event);
        };
        deleteRequest.onerror = (error) => {
          reject(patchError.call(this, error));
        };
      } else {
        reject(patchError.call(this, 'Browser does not support IndexedDB deleteDatabase!'));
      }
    })

    return dropPromise
  }
  /**
   * if contain collection
   * @param {string} Name collection Name
   * @returns {Boolean}
   */
  containCollection (name) {
    let storeNames = this.db.objectStoreNames;
    return getIndex(storeNames, name) > -1
  }
  /**
   * create collection
   * @param {string} Name collection Name
   * @param {object} options collection options
   * @returns {IDBObjectStore}
   */
  async createCollection (name, options) {
    options = Object.assign({}, DefaultObjectStoreConfig, options);

    if (this.containCollection(name)) {
      return patchError.call(this, `collection: ${name} exist`);
    }

    await toggleMode.call(this, 'versionChange');

    let objectStore = this.db.createObjectStore(name, options);

    insertCollection(this, name);
    return objectStore;
  }
  /**
   * contain index
   * @param {string} indexName inedex Name
   * @returns {Boolean}
   */
  containIndex (name, indexName) {
    let transaction;
    if (this.versionTransaction) {
      transaction = this.versionTransaction;
    } else {
      transaction = this.getTransaction(name, constantKeys.READ_ONLY);
    }
    let objectStore = transaction.objectStore(name);
    return getIndex(objectStore.indexNames, indexName) > -1;
  }
  /**
   * create index
   * @param {string} Name collection Name
   * @param {string} indexName index name
   * @param {string} keyPath keyPath
   * @param {object} objectParameters params
   * @returns {Boolean}
   */
  async createIndex (name, indexName, keyPath, objectParameters) {
    await toggleMode.call(this, 'versionChange');
    let objectStore = this.versionTransaction.objectStore(name);
    objectStore.createIndex(indexName, keyPath, objectParameters);
    return true;
  }
  /**
   * delete index
   * @param {string} Name collection Name
   * @param {string} indexName index name
   * @returns {Boolean}
   */
  async deleteIndex (name, indexName) {
    await toggleMode.call(this, 'versionChange');
    let objectStore = this.versionTransaction.objectStore(name);
    objectStore.deleteIndex(indexName);
    return true;
  }
  /**
   * delete collection
   * @param {string} Name collection Name
   * @returns {Boolean}
   */
  async deleteCollection (name) {
    if (!this.containCollection(name)) {
      return patchError.call(this, `collection: ${name} not exist`);
    }

    await toggleMode.call(this, 'versionChange');

    this.db.deleteObjectStore(name);
    return true;
  }
  /**
   * Object​Store Operaion
   * 集合的增删改查
   */
  /**
   * insert document
   * @param {string} name
   * @param {object} document
   * @param {object} options
   */
  async insert (name, document, options = {}) {
    await toggleMode.call(this, 'normal');

    let inertPromise = new Promise((resolve, reject) => {
      let objectStore = this.getObjectStore(name, constantKeys.READ_WRITE);
      let req = objectStore.add(document, options.key);

      documentHandleError.call(this, req, reject, 'add IDBRequest unknown error');

      req.onsuccess = (event) => {
        resolve(event);
      };
    })

    return inertPromise;
  }
  /**
   * update document
   * @param {string} name
   * @param {object | string} query the query params to find document
   * @param {object} data update data
   * @param {object} options as DefaultUpdateConfig
   */
  async update (name, query, data, options) {
    options = Object.assign({}, DefaultUpdateConfig, options);

    await toggleMode.call(this, 'normal');

    let findResult = await this.find(name, query);
    // if (!result && !options.upsert) return reject(patchError.call(this, 'can not find result!'));
    const UpdateFn = (result) => {
      let updatePromise = new Promise((resolve, reject) => {
        let objectStore = this.getObjectStore(name, constantKeys.READ_WRITE);
        result[objectStore.keyPath] && (data[objectStore.keyPath] = result[objectStore.keyPath]);

        if (options.extend) {
          data = Object.assign(result, data)
        }

        let req = objectStore.put(data);

        documentHandleError.call(this, req, reject, 'update IDBRequest unknown error');

        req.onsuccess = (event) => {
          resolve(event);
        };
      })

      return updatePromise;
    }

    if (options.multi) {
      return Promise.all(findResult.map(result => UpdateFn(result)));
    } else {
      let length = findResult.length;
      if (!length && !options.upsert) return patchError.call(this, 'can not find result!');
      return UpdateFn(findResult[0] || {});
    }
  }
  /**
   * remove document
   * @param {string} name
   * @param {object | string} query the query params to find document
   */
  async remove (name, query) {
    const isQueryPureObject = Object.prototype.toString.call(query) === '[object Object]'

    await toggleMode.call(this, 'normal');

    let removePromise = new Promise((resolve, reject) => {
      let objectStore = this.getObjectStore(name, constantKeys.READ_WRITE);

      let params = query;
      if (isQueryPureObject){
        params = parseQueryToIDBKeyRange(query);
      }

      let req = objectStore.delete(params);

      documentHandleError.call(this, req, reject, 'remove IDBRequest unknown error');

      req.onsuccess = (event) => {
        resolve(event);
      };
    });

    return removePromise
  }
  /**
   * find document
   * @param {string} name
   * @param {object | string} query the query params to find document
   * @param {string} indexName search by index
   */
  async find (name, query, indexName) {
    const isQueryPureObject = Object.prototype.toString.call(query) === '[object Object]'

    await toggleMode.call(this, 'normal');

    let findPromise = new Promise((resolve, reject) => {
      let objectStore = this.getObjectStore(name, constantKeys.READ_ONLY);

      let req;
      let getObj = objectStore
      if (indexName) {
        let index = objectStore.index(indexName);
        getObj = index;
      };

      if (isQueryPureObject){
        let params = parseQueryToIDBKeyRange(query);
        req = getObj.getAll(params, query.count)
      } else {
        req = getObj.getAll(query);
      }

      documentHandleError.call(this, req, reject, 'find IDBRequest unknown error');

      req.onsuccess = (event) => {
        resolve(req.result);
      };
    });

    return findPromise
  }
}
indexDBP.Version = BasicInfo.version
/** tools function
 * private
 * @include ['hasVersionError', 'getIndex', 'patchError', 'toggleMode']
 */
function parseQueryToIDBKeyRange (query) {
  let keys = Object.keys(query);
  const Islt = keys.indexOf('$lt') > -1 || keys.indexOf('$lte') > -1;
  const Isgt = keys.indexOf('$gt') > -1 || keys.indexOf('$gte') > -1;

  if (Islt && Isgt) {
    return IDBKeyRange.bound(query.$gt || query.$gte, query.$lt || query.$lte, !!query.$gt, !!query.$lt);
  } else if (Isgt) {
    return IDBKeyRange.lowerBound(query.$gt || query.$gte, !!query.$gt);
  } else if (Islt) {
    return IDBKeyRange.upperBound(query.$lt || query.$lte, query.$lt);
  } else {
    return query.value || ''
  }
};

function closeDB () {
  this.db.close();
  this.db = null;
  this.openRequest.onerror = null
  this.openRequest.onsuccess = null
  this.openRequest.onupgradeneeded = null
  this.openRequest = null
};

function hasVersionError(errorEvent) {
  if ('error' in errorEvent.target) {
      return errorEvent.target.error.name === 'VersionError';
  } else if ('errorCode' in errorEvent.target) {
      return errorEvent.target.errorCode === 12;
  }
  return false;
};

function patchError (arg) {
  let error
  if (arg instanceof Error) {
    error = arg
  } else {
    error = new Error(arg)
  }
  this.onError(error)
  return error
};
/**
 * toggle IDBDatabase transaction
 * versionChange mode for ObjectStore operation
 * normal mode for document operation
 * @param {string} mode versionChange or normal
 */
function documentHandleError (req, reject, msg) {
  req.onerror = (errorEvent) => {
    let error = errorEvent.target.error;
    reject(patchError.call(this, error.message || msg));
  };
}

function toggleMode (mode) {
  const Toggle = async (change) => {
    let name = this.db.name;
    let version = change ? this.db.version + 1: this.db.version;
    closeDB.call(this);
    await this.use(name, version);
  };

  if (mode === 'versionChange') {
    if (!this.isVersionChange) {
      return Toggle(true);
    } else {
      return Promise.resolve(true)
    }
  };

  if (mode === 'normal') {
    if (this.isVersionChange) {
      return Toggle(false);
    } else {
      return Promise.resolve(true);
    }
  };
};

function getIndex (names, name) {
  let index = -1
  for (let i = 0; i < names.length; i++) {
    if (names[i] === name) index = i
  }
  return index
};
/**
 * @env {window、Promise}
 */
const EnvDetection = function () {
  if (typeof window !== 'object') {
    console.error('only used in browsers');
  };
  if (typeof Promise === 'undefined') {
    console.error('Promise Api is needed');
  };
};
EnvDetection();

export default indexDBP;