'use strict';

const express = require('express')
const bodyParser = require('body-parser')
const alexa = require('./alexa')
const google = require('./google')
const port = process.env.PORT || 3000
const expressApp = express()

alexa.express({ expressApp })

expressApp.use(bodyParser.json());
expressApp.post('/google', google)
expressApp.listen(port)
