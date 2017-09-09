'use strict';

process.env.DEBUG = `actions-on-google:*`;

const express = require('express')
const ApiAiApp = require(`actions-on-google`).ApiAiApp
const monzo = require(`./monzo`)
const utils = require('./utils')

let actionMap = new Map();

function addIntent(intent, fn) {
  actionMap.set(intent, async function(app) {
    const token = (app.getUser()) ? app.getUser().accessToken : null
    if (!token) return app.tell('You must be logged in to use Monzo')
    await fn(app, token)
  })
}

addIntent('input.welcome', welcomeIntent)
addIntent('transactions', transactions)
addIntent('recenttransactions.recenttransactions-selectnumber', transactionSelect)
addIntent('get_balance', getBalance)
addIntent('daily_spend', dailySpend)
addIntent('Pay', pay)
addIntent('pay', pay)
addIntent('Pay.Pay-yes', payConfirm)

async function welcomeIntent (app, token) {
  const balance = await monzo.balance(token)
  return app.ask(`Hello. Your balance is ${balance}. Just say help to find out what else I can do`)
}

async function getBalance(app, token) {
  const balance = await monzo.balance(token)
  return app.tell(`Your balance is ${balance}`)
}

async function dailySpend(app, token) {
  const spend = await monzo.spentToday(token)
  return app.tell(`You've spent ${spend} today`)
}

async function transactions(app, token) {
  const numTransactions = app.getArgument('number') || 3
  const transactions = await monzo.transactions(token)
  const recentTxn = transactions.slice(-numTransactions)

  if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {

    const list = app.buildList('Transactions')
    recentTxn.forEach((transaction, index) => {
      const amount = (-transaction.amount / 100).toFixed(2)
      const balance = (transaction.account_balance / 100).toFixed(2)
      const dateTime = (new Date(transaction.created)).toString().substring(0, 21)

      let description = transaction.description.split(' ')[0]
      description = description.charAt(0).toUpperCase() + description.slice(1).toLowerCase()
      list.addItems(app.buildOptionItem(transaction.id, [(index+1).toString(), description])
        .setTitle((index+1).toString() + '. ' + description + ' (' + dateTime + ')')
        .setDescription('Amount: £' + amount + ', Balance: £' + balance)
      )
    })
    app.askWithList('Ask more about a transaction', list)

  } else {
    const speech = []
    recentTxn.forEach((transaction, index) => {
      let description = transaction.description.split(' ')[0]
      description = description.charAt(0).toUpperCase() + description.slice(1).toLowerCase()
      speech.push(description + ', ' + utils.currencyToWords(-transaction.amount, transaction.currency))
    })

    const speechText = speech.join(', ')
    app.tell(speechText)
  }
}

async function transactionSelect(app, token) {
  const id = app.getSelectedOption()
//  const transactions = await monzo.transactionById(id, token)
  app.tell('todo: ' + id)
}

async function pay(app, token) {
  const amount = app.getArgument('unit-currency')
  const givenName = app.getArgument('given-name')
  const amountWords = utils.currencyToWords(amount.amount * 100, amount.currency)

  app.ask(`Are you sure you want to send ${amountWords} to ${givenName}?`)
}

async function payConfirm(app, token) {
  const amount = app.getContextArgument('pay-followup', 'unit-currency').value
  const givenName = app.getContextArgument('pay-followup', 'given-name').value
  const amountWords = utils.currencyToWords(amount.amount * 100, amount.currency)

  app.tell(`${amountWords} sent to ${givenName}`)
}

module.exports = actionMap
