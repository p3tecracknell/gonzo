'use strict'

process.env.DEBUG = 'actions-on-google:*';

const chai = require('chai');
const expect = chai.expect;
const googleMap = require('../google.js')

describe('Trivial', async function() {
  it('101', async function() {
    const welcome = googleMap.get('input.welcome')
    var app = {
      getUser: () => {},
      tell: () => {}
    }
    const result = await welcome(app)
    console.log(result)
//    expect(true).to.equal(true)
  })
})
