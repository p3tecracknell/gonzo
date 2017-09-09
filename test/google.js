'use strict'

process.env.DEBUG = 'actions-on-google:*'

const chai = require('chai')
const sinon = require('sinon')
const assert = chai.assert

const googleMap = require('../google.js')
const monzo = require('../monzo.js')

describe('gonzo', function() {
  let mockApp
  const accessToken = 'accessToken'
  const balance = 'balance'
  const mockMonzoBalance = sinon.stub(monzo, 'balance')

  beforeEach(() => {
    mockApp = {
      getUser: sinon.stub(),
      tell: sinon.spy(),
      ask: sinon.spy()
    }
  })

  it('should check for an access token', async function() {
    const intent = googleMap.get('input.welcome')
    mockApp.getUser.returns(null)

    await intent(mockApp)
    
    assert(mockApp.tell.calledWith('You must be logged in to use Monzo'), 'End conversation with message')
    assert(mockApp.ask.notCalled, 'Check ask is not called in addition to tell')
  })

  it('should provide a welcome intent', async function() {
    const intent = googleMap.get('input.welcome')
    mockMonzoBalance.returns(balance)
    mockApp.getUser.returns({ accessToken })

    await intent(mockApp)

    assert(mockApp.ask.calledWith(`Hello. Your balance is ${balance}. Just say help to find out what else I can do`))
    assert(mockApp.tell.notCalled)
  })
})
