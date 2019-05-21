var IndexedDBP = require('../../dist/IndexedDBP').default;

module.exports.createOSTest = async () => {
  let mydb = new IndexedDBP({name: 'testObjectStoreDB'});
  await mydb.init();

  if (!mydb.containObjectStore('testObjectStore')) {
    await mydb.createObjectStore('testObjectStore');
  }

  let isContain = mydb.containObjectStore('testObjectStore');

  mydb.closeDB();

  return isContain
}

module.exports.deleteOSTest = async () => {
  let mydb = new IndexedDBP({name: 'testObjectStoreDB'});
  await mydb.init();

  if (mydb.containObjectStore('testObjectStore')) {
    await mydb.deleteObjectStore('testObjectStore');
  }

  mydb.closeDB();

  return mydb.containObjectStore('testObjectStore');
}

module.exports.createIndexTest = async () => {
  let mydb = new IndexedDBP({name: 'testIndexDB'});
  await mydb.init();

  if (!mydb.containObjectStore('testIndexOS')) {
    await mydb.createObjectStore('testIndexOS', {keyPath: 'randomId'});
  }

  let isContainIndexBefore = await mydb.$db.testIndexOS.containIndex('time');

  if (!isContainIndexBefore) {
    await mydb.$db.testIndexOS.createIndex('time', 'time', {unique: false, multiEntry: false});
  }

  let isContainIndex = mydb.$db.testIndexOS.containIndex('time');

  mydb.closeDB();

  return isContainIndex;
}

module.exports.deleteIndexTest = async () => {
  let mydb = new IndexedDBP({name: 'testIndexDB'});
  await mydb.init();

  if (mydb.containObjectStore('testIndexOS')) {
    await mydb.$db.testIndexOS.deleteIndex('time');
  }

  let isContainIndex = mydb.$db.testIndexOS.containIndex('time');

  mydb.closeDB();

  return isContainIndex;
}