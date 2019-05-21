var indexedDBP = require('../../dist/IndexedDBP').default;

module.exports.openDBTest = async () => {
  let mydb = new indexedDBP({name: 'testUseDB'});
  await mydb.init();

  let isDBExit = await mydb.containDataBase('testUseDB');
  return isDBExit
}

module.exports.deleteDBTest = async () => {
  let mydb = new indexedDBP({name: 'testDeleteDB'});
  await mydb.init();

  await mydb.dropDatabase();

  let isDBExit = await mydb.containDataBase('testDeleteDB');
  return isDBExit
}