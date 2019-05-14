import IndexDBP from '../dist/indexDBP'

!async function () {
  var mydb = new IndexDBP();
  await mydb.use('testDB');

  // deleteIndex
  // if (mydb.containCollection('indexCollection') && mydb.$db.indexCollection.containIndex('time')) {
  //   await mydb.$db.indexCollection.deleteIndex('time')
  // }

  // create collection
  if (!mydb.containCollection('testCollection')) {
    await mydb.createCollection('testCollection');
  }
  if (!mydb.containCollection('indexCollection')) {
    await mydb.createCollection('indexCollection', {keyPath: 'randomId'});
    await mydb.$db.indexCollection.createIndex('time', 'time', {unique: false, multiEntry: false})
  }

  // delete Collection
  // if (mydb.containCollection('testCollection2')) {
  //   mydb.deleteCollection('testCollection2');
  // }

  // insert Data
  await mydb.$db.testCollection.insert({key1: 'hello', key2: 123, key3: true, key4: new Date()});
  let rand1 = Math.random(), rand2 = Math.random();
  await mydb.$db.indexCollection.insert({randomId: rand1, time: new Date('2019/04/03')});
  await mydb.$db.indexCollection.insert({randomId: rand2, time: new Date('2019/04/05')});
  // find Data
  let res0 = await mydb.$db.testCollection.find(1);
  let res1 = await mydb.$db.indexCollection.find(new Date('2019/04/03'), 'time');
  let res2 = await mydb.$db.indexCollection.find({$lte: rand2 , count: 5});
  console.log(res0, res1);
  console.log(res2, rand2);
  // remove data
  // let resRemove = await mydb.$db.testCollection.remove({$lte: 5});
  // console.log(resRemove);
  // update data
  // let resUpdate = await mydb.$db.testCollection.update({$lte: 10}, {test: 222}, {multi: true});
  let resUpdate = await mydb.$db.testCollection.update(1, {test: 222}, {upsert: true});
  console.log(resUpdate);
}()
