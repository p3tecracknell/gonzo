'use strict';

const alexa = require('alexa-app');
const monzo = require(`./monzo`)
const utils = require('./utils')

const alexaApp = new alexa.app('helloWorld');
module.exports = alexaApp

function addIntent(intent, fn) {
  alexaApp.intent(intent, async function(request, response) {
    const token = request.sessionDetails.accessToken
    if (!token) return response.say('You must be logged in to use Monzo')
    await fn(request, response, token)
  })
}

addIntent('Welcome', welcomeIntent)
addIntent('RecentTransactions', transactions)
addIntent('GetBalance', getBalance)
addIntent('DailySpend', dailySpend)

async function welcomeIntent (request, response, token) {
  const balance = await monzo.balance(token)
  return response.say(`Hello. Your balance is ${balance}. Just say help to find out what else I can do`)
}

async function getBalance(request, response, token) {
  const balance = await monzo.balance(token)
  return response.say(`Your balance is ${balance}`)
}

async function dailySpend(request, response, token) {
  const spend = await monzo.spentToday(token)
  return response.say(`You've spent ${spend} today`)
}

async function transactions(request, response, token) {
  const numTransactions = app.getArgument('number') || 3
  const transactions = await monzo.transactions(token)
  const recentTxn = transactions.slice(-numTransactions)
  const speech = []

  const list = app.buildList('Transactions')
  recentTxn.forEach((transaction, index) => {
    const amount = (-transaction.amount / 100).toFixed(2)
    const balance = (transaction.account_balance / 100).toFixed(2)
    const dateTime = (new Date(transaction.created)).toString().substring(0, 21)

    let description = transaction.description.split(' ')[0]
    description = description.charAt(0).toUpperCase() + description.slice(1).toLowerCase()
    speech.push(description + ', ' + utils.currencyToWords(-transaction.amount, transaction.currency))
    list.addItems(app.buildOptionItem('txn'+index.toString())
      .setTitle((index+1).toString() + '. ' + description + ' (' + dateTime + ')')
      .setDescription('Amount: £' + amount + ', Balance: £' + balance)
    )
  })

  const speechText = speech.join(', ')
  app.askWithList(app.buildRichResponse().addSimpleResponse(speechText), list)
}
