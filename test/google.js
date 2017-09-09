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
    mockApp.getUser.returns({ accessToken })
    mockMonzoBalance.returns(balance)

    await intent(mockApp)

    assert(mockApp.ask.calledWith(`Hello. Your balance is ${balance}. Just say help to find out what else I can do`))
    assert(mockApp.tell.notCalled)
  })

  it('should handle invalid access token', async function() {
    const intent = googleMap.get('input.welcome')
    mockApp.getUser.returns({ accessToken })
    mockMonzoBalance.throws('test')

    await intent(mockApp)

    assert(mockApp.tell.calledWith('Sorry, please try again later'))
    assert(mockApp.ask.notCalled, 'Check ask is not called in addition to tell')
  })
})
