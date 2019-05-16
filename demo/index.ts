import IndexDBP from '../dist/indexDBP.js';

(async () => {
  const mydb = new IndexDBP({
    name: 'testDB',
  });
  await mydb.init();
  // deleteIndex
  // if (mydb.containObjectStore('indexObjectStore') && mydb.$db.indexObjectStore.containIndex('time')) {
  //   await mydb.$db.indexObjectStore.deleteIndex('time')
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
