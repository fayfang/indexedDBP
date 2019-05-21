var chai = require('chai');
var {simpleDOCount, simpleDOFind, simpleDOInsert, simpleDORemove, simpleDOUpdate,
  complexDOFind, complexDOInsert, complexDORemove, complexDOUpdate} = require('./example/document');
var expect = chai.expect;

describe('test of simple document operation', function() {
  it('insert a document', async function() {
    let result = await simpleDOInsert();

    expect(result).to.equal(true);
  })
  it('find a document', async function() {
    let result = await simpleDOFind();

    expect(result).to.equal(true);
  })
  it('count a document', async function() {
    let result = await simpleDOCount();

    expect(result).to.equal(true);
  })
  it('update a document', async function() {
    let result = await simpleDOUpdate();

    expect(result).to.equal(true);
  })
  it('remove a document', async function() {
    let result = await simpleDORemove();

    expect(result).to.equal(true);
  })
})

describe('test of complex document operation', function() {
  it('insert a document', async function() {
    let result = await complexDOInsert();

    expect(result).to.equal(true);
  })
  it('find a document', async function() {
    let result = await complexDOFind();

    expect(result).to.equal(true);

  })
  it('update a document', async function() {
    let result = await complexDOUpdate();

    expect(result).to.equal(true);
  })
  it('remove a document', async function() {
    let result = await complexDORemove();

    expect(result).to.equal(true);
  })
})