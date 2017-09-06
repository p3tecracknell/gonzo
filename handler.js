'use strict';

const express = require('express')
const bodyParser = require('body-parser')
const alexa = require('./alexa')
const alexa2 = require('./alexa2')
const google = require('./google')
const port = process.env.PORT || 3000
const expressApp = express()

alexa.express({ expressApp })
alexa2.express({ expressApp })

expressApp.use(bodyParser.json());
expressApp.post('/google', google)
expressApp.listen(port)
