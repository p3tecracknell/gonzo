'use strict';

const express = require('express')
const bodyParser = require('body-parser')

const ApiAiApp = require(`actions-on-google`).ApiAiApp
const google = require('./google')

const port = process.env.PORT || 3000
const expressApp = express()

const alexa = require('./alexa')
const alexa2 = require('./alexa2')
alexa.express({ expressApp })
alexa2.express({ expressApp })

expressApp.use(bodyParser.json());
expressApp.post('/google', function(request, response) {
  console.log(request)
  const app = new ApiAiApp({request, response})
  app.handleRequest(google)
})

expressApp.listen(port, () => console.log('Started'))
