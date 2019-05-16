var chai = require('chai');
var IndexDBP = require('../dist/indexDBP').default;
var expect = chai.expect;

describe('test of db operation', function() {
  it('open a database', async function() {
    let mydb = new IndexDBP({name: 'testDB'});
    await mydb.init();
    expect(mydb.db.name).to.equal('testDB');
  })
})