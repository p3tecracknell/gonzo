"use strict";

process.env.DEBUG = `actions-on-google:*`;

const express = require('express')
const bodyParser = require('body-parser')
const ApiAiApp = require(`actions-on-google`).ApiAiApp
const monzo = require(`./monzo`)
const utils = require('./utils')

const port = process.env.PORT || 3000

const expressApp = express()
expressApp.use(bodyParser.json());
expressApp.post('*', function(request, response) {
	const app = new ApiAiApp({request, response})

  function welcomeIntent (app) {
    const token = app.getUser().accessToken;
    if (!token) return app.tell('You must be logged in to use Monzo')

    return monzo.balance(token)
      .then(balance => app.ask(`Hello. Your balance is ${balance}. Just say help to find out what else I can do`))
  }

  function getBalance() {
    const token = app.getUser().accessToken
    return monzo.balance(token)
      .then(balance => app.tell(`Your balance is ${balance}`));
  }

  function dailySpend() {
    const token = app.getUser().accessToken
    return monzo.spentToday(token)
      .then(spentToday => app.tell(`You've spent ${spentToday} today`));
  }

  function transactions() {
    const token = app.getUser().accessToken
    monzo.transactions(token)
      .then(transactions => {
        const lastThree = transactions.slice(-3)
        const speech = []

        const list = app.buildList('Transactions')
        lastThree.forEach((transaction, index) => {
          const amount = (-transaction.amount / 100).toFixed(2)
          const balance = (transaction.account_balance / 100).toFixed(2)

          let description = transaction.description.split(' ')[0]
          description = description.charAt(0).toUpperCase() + description.slice(1).toLowerCase()
          speech.push(description + ', ' + utils.currencyToWords(-transaction.amount, transaction.currency))
          list.addItems(app.buildOptionItem(index.toString())
            .setTitle(description + ' (£' + amount + ')')
            .setDescription(Balance: £' + balance)
          )
        })

        const speechText = speech.join(', ')
        app.askWithList(app.buildRichResponse()
          .addSimpleResponse(speechText), list)
      })

//    return app.tell('Transaction list..')
  }

	let actionMap = new Map();
  actionMap.set('input.welcome', welcomeIntent)
  actionMap.set('transactions', transactions)
  actionMap.set('get_balance', getBalance)
  actionMap.set('daily_spend', dailySpend)
  app.handleRequest(actionMap)
})

expressApp.listen(port)
