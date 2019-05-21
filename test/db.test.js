var chai = require('chai');
var expect = chai.expect;
var {openDBTest, deleteDBTest} = require('./example/db');

describe('test of db operation', function() {
  it('open a database', async function() {
    let isDBExit = await openDBTest();

    expect(isDBExit).to.equal(true);
  })

  it('delete database', async function() {
    let isDBExit = await deleteDBTest();

    expect(isDBExit).to.equal(false);
  })
})