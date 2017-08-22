"use strict";

process.env.DEBUG = `actions-on-google:*`;

const express = require('express')
const bodyParser = require('body-parser')
const ApiAiApp = require(`actions-on-google`).ApiAiApp
const monzo = require(`./monzo`);

const expressApp = express()
expressApp.use(bodyParser.json());
expressApp.post('*', function(request, response) {
	const app = new ApiAiApp({request, response})

  function welcomeIntent (app) {
    let token = app.getUser().accessToken;
    if (!token) {
      app.askForSignIn()
    } else {
      return monzo.balance(token)
        .then(balance => app.ask(`Hello. Your balance is ${balance}. Just say help to find out what else I can do`))
    }
  }

  function signIn (app) {
    if (app.getSignInStatus() === app.SignInstatus.OK) {
      let accessToken = app.getUser().accessToken;
      app.ask('Great, thanks for signing in!');
    } else {
      app.ask('I cannot get Monzo details without signing in');
    }
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

	let actionMap = new Map();
  actionMap.set('input.welcome', welcomeIntent)
  actionMap.set('sign.in', signIn)
  actionMap.set('get_balance', getBalance)
  actionMap.set('daily_spend', dailySpend)
  app.handleRequest(actionMap)
})

expressApp.listen(3000)
