var chai = require('chai');
var indexedDBPP = require('../dist/indexedDBP').default;
var expect = chai.expect;

describe('test of objectStore operation', function() {
  it('create a objectStore', async function() {
    let mydb = new indexedDBPP({name: 'testObjectStoreDB'});
    await mydb.init();

    if (!mydb.containObjectStore('testObjectStore')) {
      await mydb.createObjectStore('testObjectStore');
    }

    expect(mydb.containObjectStore('testObjectStore')).to.equal(true);
  })

  it('delete a objectStore', async function() {
    let mydb = new indexedDBPP({name: 'testObjectStoreDB'});
    await mydb.init();

    if (mydb.containObjectStore('testObjectStore')) {
      await mydb.deleteObjectStore('testObjectStore');
    }

    expect(mydb.containObjectStore('testObjectStore')).to.equal(false);
  })

  it('create a index', async function() {
    let mydb = new indexedDBPP({name: 'testindexedDBP'});
    await mydb.init();

    if (!mydb.containObjectStore('testindexedDBP')) {
      await mydb.createObjectStore('testindexedDBP', {keyPath: 'randomId'});
      await mydb.$db.testindexedDBP.createIndex('time', 'time', {unique: false, multiEntry: false});
    }

    let isContainIndex = mydb.$db.testindexedDBP.containIndex('time');
    expect(isContainIndex).to.equal(true);
  })

  it('delete a index', async function() {
    let mydb = new indexedDBPP({name: 'testindexedDBP'});
    await mydb.init();

    if (mydb.containObjectStore('testindexedDBP')) {
      console.log(123);
      await mydb.toggleMode('versionChange');
      await mydb.$db.testindexedDBP.deleteIndex('time');
    }

    let isContainIndex = mydb.$db.testindexedDBP.containIndex('time');
    expect(isContainIndex).to.equal(false);
  })
})