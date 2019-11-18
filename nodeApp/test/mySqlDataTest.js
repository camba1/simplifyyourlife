'use strict'

const chai = require('chai');
const expect  = require('chai').expect;
const mySqlData = require('./../src/mySqlData');

//Pull DB data test
const foo = 'bar';
describe('mySqlData Tests',() => {
  describe('Dummy Test', () => {
    it('is a dummy test', () => {
      expect(foo).to.be.a('string');
      expect(foo).to.equal('bar');
      expect(foo).to.have.lengthOf(3);
    });
  });
  describe('Get Data from MySql', () => {
    it('Get data from test table', async () => {
      let myData = await mySqlData.getMySqlDataProm();
      mySqlData.closePool();
      expect(myData).to.not.be.null;
      expect(myData).to.be.an('array');
    });
  })
})
