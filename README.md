# IndexedDBP
![pass](https://travis-ci.org/fayfang/indexedDBP.svg?branch=master)
IndexedDBP is a simple way to use IndexedDB in browsers, base on Promise, similiar to mongoDB api.

```npm install indexeddbp```

## example
``` typeScript
import IndexedDBP from 'indexeddbp';
(async () => {
await mydb.init();
  // deleteIndex
  // const isContainIndex = await mydb.$db.indexObjectStore.containIndex('time');
  // if (mydb.containObjectStore('indexObjectStore') && isContainIndex) {
  //   await mydb.$db.indexObjectStore.deleteIndex('time');
  // } else if (mydb.containObjectStore('indexObjectStore')) {
  //   await mydb.$db.indexObjectStore.createIndex('time', 'time', {unique: false, multiEntry: false});
  // }

  // create objectStore
  if (!mydb.containObjectStore('testObjectStore')) {
    await mydb.createObjectStore('testObjectStore');
  }
  if (!mydb.containObjectStore('indexObjectStore')) {
    await mydb.createObjectStore('indexObjectStore', {keyPath: 'randomId'});
    await mydb.$db.indexObjectStore.createIndex('time', 'time', {unique: false, multiEntry: false});
  }

  // delete ObjectStore
  // if (mydb.containObjectStore('testObjectStore2')) {
  //   mydb.deleteObjectStore('testObjectStore2');
  // }

  // insert Data
  const count = await mydb.$db.testObjectStore.count({$lte: 2});
  console.log(count);
  await mydb.$db.testObjectStore.insert({key1: 'hello', key2: 123, key3: true, key4: new Date()});
  const rand1: number = Math.random();
  const rand2: number = Math.random();
  await mydb.$db.indexObjectStore.insert({randomId: rand1, time: new Date('2019/04/03')});
  await mydb.$db.indexObjectStore.insert({randomId: rand2, time: new Date('2019/04/05')});
  // find Data
  const res0 = await mydb.$db.testObjectStore.find(1);
  const res1 = await mydb.$db.indexObjectStore.find(new Date('2019/04/03'), 'time');
  const res2 = await mydb.$db.indexObjectStore.find({$lte: rand2 , count: 5});
  console.log(res0, res1);
  console.log(res2, rand2);
  // remove data
  // let resRemove = await mydb.$db.testObjectStore.remove({$lte: 5});
  // console.log(resRemove);
  // update data
  // let resUpdate = await mydb.$db.testObjectStore.update({$lte: 10}, {test: 222}, {multi: true});
  const resUpdate = await mydb.$db.testObjectStore.update(1, {test: 222}, {upsert: true});
  console.log(resUpdate);
})();
```
more example to see [demo](https://github.com/fayfang/indexedDBP/tree/master/test/example)

## operation
### Database Operation
##### constructor (options?: $\color{red}{object}$)
+ constructor of the class
+ default options = {name: 'indexedDBP', version: 1, onError: fn, onSuccess: fn}

##### db.containDataBase(databaseName: $\color{red}{string}$):  $\color{blue}{Promise}$):
+ a database exist or not, you can use it before init()

##### db.init(): $\color{blue}{Promise}$
+ init the database, you must init a new instance before other operation

##### db.closeDB(): $\color{blue}{undefined}$
+ close the database

##### db.dropDatabase(): $\color{blue}{Promise}$
+ delete the databse

### ObjectStore Operation
##### db.containObjectStore(name: $\color{red}{string}$): $\color{blue}{boolean}$
+ the database contain the obejectStore or not

##### db.createObjectStore(name: $\color{red}{string}$, options?: $\color{red}{ObjectStoreOptions}$): $\color{blue}{Promise}$
+ create objectStore in this database
+ default ObjectStoreOptions = {autoIncrement: true, keyPath: 'id'};

##### db.deleteObjectStore(name: $\color{red}{string}$)
+ Delete objectStore in this database

### Document Operation
##### db.objectStoreName.containIndex(indexName: $\color{red}{string}$):  $\color{blue}{Promise}$
+ the obejectStore contain the index or not

##### db.objectStoreName.createIndex(indexName:  $\color{red}{string}$, keyPath?: $\color{red}{string}$, objectParameters?:  $\color{red}{IDBIndexParameters}$):  $\color{blue}{Promise}$
+ create a index for the objectStore
+ [IDBIndexParameters](https://developer.mozilla.org/en-US/docs/Web/API/IDBIndexParameters)

##### db.objectStoreName.deleteIndex(indexName: $\color{red}{string}$):  $\color{blue}{Promise}$
+ create a index of the objectStore

##### db.objectStoreName.count(query?:$\color{red}{QueryOptions}$):  $\color{blue}{Promise}$
+ count the objectStoreName by QueryOptions
+ get total when query is undefined

##### db.objectStoreName.find(query:$\color{red}{key | index | QueryOptions}$, indexName?: $\color{red}{string}$):  $\color{blue}{Promise}$
+ fint data by query

##### db.objectStoreName.insert(document:$\color{red}{any}$, key?: $\color{red}{string}$):  $\color{blue}{Promise}$
+ insert data

##### db.objectStoreName.update(query:$\color{red}{key | QueryOptions}$, data: $\color{red}{any}$, options?: $\color{red}{UpdateOptions}$):  $\color{blue}{Promise}$
+ update data
+ default UpdateOptions = {upsert: false, multi: fasle, extend: true}

##### db.objectStoreName.remove(query?:$\color{red}{key | QueryOptions}$):  $\color{blue}{Promise}$
+ remove data

## Interface
``` typeScript
interface ObjectStoreOptions {
  autoIncrement?: boolean;
  keyPath?: string;
}

interface QueryOptions {
  value?: any;
  count?: number;
  $lt?: any;
  $lte?: any;
  $gte?: any;
  $gt?: any;
}

interface UpdateOptions {
  extend?: boolean;
  multi?: boolean;
  upsert?: boolean;
}

interface IndexedDBPOptions {
  name: string;
  version?: number;
  onError?: any;
  onSuccess?: any;
}
```


