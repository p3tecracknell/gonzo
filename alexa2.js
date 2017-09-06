'use strict';

const alexa = require('alexa-app');
const utils = require('./utils')

const alexaApp = new alexa.app('hello-world');
module.exports = alexaApp

function addIntent(intent, fn) {
  alexaApp.intent(intent, async function(request, response) {
    console.log(request)
    const token = request.sessionDetails.accessToken
//    if (!token) return response.linkAccount()
    await fn(request, response, token)
    console.log(response)
  })
}

addIntent('Welcome', helloWorld)
addIntent('HelloWorld', helloWorld)

function helloWorld (request, response, token) {
  return response.say(`Hello World. Token(${token})`)
}
