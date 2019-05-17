var chai = require('chai');
var indexedDBP = require('../dist/indexedDBP').default;
var expect = chai.expect;

describe('test of simple document operation', function() {
  it('insert a document', async function() {
    let mydb = new indexedDBP({name: 'insertDocument'});
    await mydb.init();

    if (!mydb.containObjectStore('testInsert')) {
      await mydb.createObjectStore('testInsert');
    }

    let result = await mydb.$db.testInsert.insert({id: 'testInsert1', word: 'hello world'});

    expect(result && (result.type === 'success')).to.equal(true);
  })
  it('find a document', async function() {
    let mydb = new indexedDBP({name: 'insertDocument'});
    await mydb.init();

    const res = await mydb.$db.testInsert.find('testInsert1');

    expect(res[0].word).to.equal('hello world');
  })
  it('count a document', async function() {
    let mydb = new indexedDBP({name: 'insertDocument'});
    await mydb.init();

    const res = await mydb.$db.testInsert.count();

    expect(res).to.equal(1);
  })
  it('update a document', async function() {
    let mydb = new indexedDBP({name: 'insertDocument'});
    await mydb.init();

    await mydb.$db.testInsert.update('testInsert1', {word: 'hello fay'});

    const res = await mydb.$db.testInsert.find('testInsert1');

    expect(res[0].word).to.equal('hello fay');
  })
  it('remove a document', async function() {
    let mydb = new indexedDBP({name: 'insertDocument'});
    await mydb.init();

    await mydb.$db.testInsert.remove('testInsert1', {word: 'hello fay'});

    const res = await mydb.$db.testInsert.find('testInsert1');

    expect(res.length).to.equal(0);
  })
})

describe('test of complex document operation', function() {
  let counter = 0;

  it('insert a document', async function() {
    let mydb = new indexedDBP({name: 'insertDocument'});
    await mydb.init();

    if (!mydb.containObjectStore('testInsert2')) {
      await mydb.createObjectStore('testInsert2', {keyPath: 'counterID'});
      await mydb.$db.testInsert2.createIndex('time', 'time', {unique: false, multiEntry: false});
    }

    for(let i = 0; i < 10; i++) {
      await mydb.$db.testInsert2.insert({counterID: counter++, time: new Date(2019, 4, i)});
    }

    let count = await mydb.$db.testInsert2.count();

    expect(count).to.equal(10);
  })
  // it('find a document', async function() {
  //   let mydb = new indexedDBP({name: 'insertDocument'});
  //   await mydb.init();

  //   const res0 = await mydb.$db.testInsert2.find({
  //     $lt
  //   });

  //   expect(res[0].word).to.equal('hello world');
  // })
  // it('update a document', async function() {
  //   let mydb = new indexedDBP({name: 'insertDocument'});
  //   await mydb.init();

  //   await mydb.$db.testInsert.update('testInsert1', {word: 'hello fay'});

  //   const res = await mydb.$db.testInsert.find('testInsert1');

  //   expect(res[0].word).to.equal('hello fay');
  // })
  // it('remove a document', async function() {
  //   let mydb = new indexedDBP({name: 'insertDocument'});
  //   await mydb.init();

  //   await mydb.$db.testInsert.remove('testInsert1', {word: 'hello fay'});

  //   const res = await mydb.$db.testInsert.find('testInsert1');

  //   expect(res.length).to.equal(0);
  // })
})