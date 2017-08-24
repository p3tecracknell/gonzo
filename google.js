'use strict';

process.env.DEBUG = `actions-on-google:*`;

const express = require('express')
const alexa = require('alexa-app');
const bodyParser = require('body-parser')
const ApiAiApp = require(`actions-on-google`).ApiAiApp
const monzo = require(`./monzo`)
const utils = require('./utils')

let actionMap = new Map();

function addIntent(intent, fn) {
  actionMap.set(intent, async function(app) {
    const token = app.getUser().accessToken;
    if (!token) return app.tell('You must be logged in to use Monzo')
    await fn(app, token)
  })
}

addIntent('input.welcome', welcomeIntent)
addIntent('transactions', transactions)
addIntent('get_balance', getBalance)
addIntent('daily_spend', dailySpend)

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

module.exports = function(request, response) {
	const app = new ApiAiApp({request, response})
  app.handleRequest(actionMap)
}
