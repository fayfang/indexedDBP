var chai = require('chai');
var indexedDBP = require('../dist/indexedDBP').default;
var expect = chai.expect;

describe('test of db operation', function() {
  it('open a database', async function() {
    let mydb = new indexedDBP({name: 'testUseDB'});
    await mydb.init();

    // 新增加的db是versionchange的transaction,此时无法查询，先toggleMode变更到normal
    await mydb.toggleMode('normal');

    let DBnames = await indexedDB.databases();
    DBnames = DBnames.map(db => db.name);

    expect(DBnames.indexOf('testUseDB') > -1).to.equal(true);
  })

  it('delete database', async function() {
    let mydb = new indexedDBP({name: 'testDeketeDB'});
    await mydb.init();

    await mydb.dropDatabase();

    let DBnames2 = await indexedDB.databases();
    DBnames2 = DBnames2.map(db => db.name);

    expect(DBnames2.indexOf('testDeketeDB') === -1).to.equal(true);
  })
})