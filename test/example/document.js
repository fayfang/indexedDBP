var indexedDBP = require('../../dist/IndexedDBP').default;

module.exports.simpleDOInsert = async () => {
  let mydb = new indexedDBP({name: 'insertDocument'});
  await mydb.init();

  if (!mydb.containObjectStore('testInsert')) {
    await mydb.createObjectStore('testInsert');
  }

  let result = await mydb.$db.testInsert.insert({id: 'testInsert1', word: 'hello world'});

  mydb.closeDB();

  return result && (result.type === 'success');
}

module.exports.simpleDOFind = async () => {
  let mydb = new indexedDBP({name: 'insertDocument'});
  await mydb.init();

  const res = await mydb.$db.testInsert.find('testInsert1');

  mydb.closeDB();

  return res[0].word === 'hello world';
}

module.exports.simpleDOCount = async () => {
  let mydb = new indexedDBP({name: 'insertDocument'});
  await mydb.init();

  const res = await mydb.$db.testInsert.count();

  mydb.closeDB();

  return res === 1;
}

module.exports.simpleDOUpdate = async () => {
  let mydb = new indexedDBP({name: 'insertDocument'});
  await mydb.init();

  await mydb.$db.testInsert.update('testInsert1', {word: 'hello fay'});

  const res = await mydb.$db.testInsert.find('testInsert1');

  mydb.closeDB();

  return res[0].word === 'hello fay';
}

module.exports.simpleDORemove = async () => {
  let mydb = new indexedDBP({name: 'insertDocument'});
  await mydb.init();

  await mydb.$db.testInsert.remove('testInsert1', {word: 'hello fay'});

  const res = await mydb.$db.testInsert.find('testInsert1');

  mydb.closeDB();

  return res.length === 0;
}

module.exports.complexDOInsert = async () => {
  let mydb = new indexedDBP({name: 'insertDocument'});
  await mydb.init();

  if (!mydb.containObjectStore('testInsert2')) {
    await mydb.createObjectStore('testInsert2', {keyPath: 'counterID'});
    await mydb.$db.testInsert2.createIndex('time', 'time', {unique: false, multiEntry: false});
  }

  for(let i = 0; i < 10; i++) {
    await mydb.$db.testInsert2.insert({counterID: i, time: new Date(2019, 5, i), });
  }

  let count = await mydb.$db.testInsert2.count();

  mydb.closeDB();

  return count === 10;
}

module.exports.complexDOFind = async () => {
  let mydb = new indexedDBP({name: 'insertDocument'});
  await mydb.init();

  const res1 = await mydb.$db.testInsert2.find({
    $lt: 5
  });

  const res2 = await mydb.$db.testInsert2.find({
    $gte: new Date(2019, 5, 6)
  }, 'time');

  const res3 = await mydb.$db.testInsert2.find(2)

  mydb.closeDB();

  return res1.length === 5 && res2.length === 4 && res3[0].time.toString() === new Date(2019, 5, 2).toString();
}

module.exports.complexDOUpdate = async () => {
  let mydb = new indexedDBP({name: 'insertDocument'});
  await mydb.init();

  const res = await mydb.$db.testInsert2.update({
    $lt: 3
  }, {
    time: new Date(2019, 11, 11)
  }, {
    multi: true
  });

  const res2 = await mydb.$db.testInsert2.find(new Date(2019, 11, 11), 'time');

  mydb.closeDB();

  return res2.length == 3;
}

module.exports.complexDORemove = async () => {
  let mydb = new indexedDBP({name: 'insertDocument'});
  await mydb.init();

  const res1 = await mydb.$db.testInsert2.remove({
    $gte: 0
  });

  const res2 = await mydb.$db.testInsert2.find({
    $gte: 0
  });

  mydb.closeDB();

  return res2,length === 0;
}