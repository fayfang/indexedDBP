import IndexedDBP from '../src/main';
import {openDBTest, deleteDBTest} from '../test/example/db';
import {deleteOSTest, createOSTest, createIndexTest, deleteIndexTest} from '../test/example/objectStore';
import {simpleDOCount, simpleDOFind, simpleDOInsert, simpleDORemove, simpleDOUpdate,
  complexDOFind, complexDOInsert, complexDORemove, complexDOUpdate} from '../test/example/document';

// db test
// (async () => {
//   const res1 = await openDBTest();
//   console.log(res1);
//   const res2 = await deleteDBTest();
//   console.log(res2);
// })();

// objectStore test
// (async () => {
//   const res3 = await createOSTest();
//   console.log(res3);
//   const res4 = await deleteOSTest();
//   console.log(res4);
//   const res5 = await createIndexTest();
//   console.log(res5);
//   const res6 = await deleteIndexTest();
//   console.log(res6);
// })();

// document test
(async () => {
  const res1 = await simpleDOInsert();
  console.log(res1);
  const res2 = await simpleDOCount();
  console.log(res2);
  const res3 = await simpleDOFind();
  console.log(res3);
  const res4 = await simpleDOUpdate();
  console.log(res4);
  const res5 = await simpleDORemove();
  console.log(res5);
  const res6 = await complexDOInsert();
  console.log(res6);
  const res7 = await complexDOFind();
  console.log(res7);
  const res8 = await complexDOUpdate();
  console.log(res8);
  const res9 = await complexDORemove();
  console.log(res9);
})();

// (async () => {
//   const mydb = new IndexedDBP({
//     name: 'testDB',
//   });
//   await mydb.init();
//   // deleteIndex
//   // const isContainIndex = await mydb.$db.indexObjectStore.containIndex('time');
//   // if (mydb.containObjectStore('indexObjectStore') && isContainIndex) {
//   //   await mydb.$db.indexObjectStore.deleteIndex('time');
//   // } else if (mydb.containObjectStore('indexObjectStore')) {
//   //   await mydb.$db.indexObjectStore.createIndex('time', 'time', {unique: false, multiEntry: false});
//   // }

//   // create objectStore
//   if (!mydb.containObjectStore('testObjectStore')) {
//     await mydb.createObjectStore('testObjectStore');
//   }
//   if (!mydb.containObjectStore('indexObjectStore')) {
//     await mydb.createObjectStore('indexObjectStore', {keyPath: 'randomId'});
//     await mydb.$db.indexObjectStore.createIndex('time', 'time', {unique: false, multiEntry: false});
//   }

//   // delete ObjectStore
//   // if (mydb.containObjectStore('testObjectStore2')) {
//   //   mydb.deleteObjectStore('testObjectStore2');
//   // }

//   // insert Data
//   const count = await mydb.$db.testObjectStore.count({$lte: 2});
//   console.log(count);
//   await mydb.$db.testObjectStore.insert({key1: 'hello', key2: 123, key3: true, key4: new Date()});
//   const rand1: number = Math.random();
//   const rand2: number = Math.random();
//   await mydb.$db.indexObjectStore.insert({randomId: rand1, time: new Date('2019/04/03')});
//   await mydb.$db.indexObjectStore.insert({randomId: rand2, time: new Date('2019/04/05')});
//   // find Data
//   const res0 = await mydb.$db.testObjectStore.find(1);
//   const res1 = await mydb.$db.indexObjectStore.find(new Date('2019/04/03'), 'time');
//   const res2 = await mydb.$db.indexObjectStore.find({$lte: rand2 , count: 5});
//   console.log(res0, res1);
//   console.log(res2, rand2);
//   // remove data
//   // let resRemove = await mydb.$db.testObjectStore.remove({$lte: 5});
//   // console.log(resRemove);
//   // update data
//   // let resUpdate = await mydb.$db.testObjectStore.update({$lte: 10}, {test: 222}, {multi: true});
//   const resUpdate = await mydb.$db.testObjectStore.update(1, {test: 222}, {upsert: true});
//   console.log(resUpdate);
// })();
