var chai = require('chai');
var expect = chai.expect;
var {createOSTest, deleteOSTest, createIndexTest, deleteIndexTest} = require('./example/objectStore');

describe('test of objectStore operation', function() {
  it('create a objectStore', async function() {
    let isOSExit = await createOSTest();
    expect(isOSExit).to.equal(true);
  })

  it('delete a objectStore', async function() {
    let isOSExit = await deleteOSTest();
    expect(isOSExit).to.equal(false);
  })

  it('create a index', async function() {
    let isIndexExit = await createIndexTest();
    expect(isIndexExit).to.equal(true);
  })

  it('delete a index', async function() {
    let isIndexExit = await deleteIndexTest();
    expect(isIndexExit).to.equal(false);
  })
})