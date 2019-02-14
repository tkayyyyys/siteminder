require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const log4js = require('log4js');
const indexRouter = require('./routes/index');

// Server Logging to local dir: logs/logs.log
log4js.configure({
  appenders: { siteminder: { type: 'file', filename: 'logs/logs.log' } },
  categories: { default: { appenders: ['siteminder'], level: 'debug' } }
});
const logger = log4js.getLogger('siteminder');

// Express
var app = express();
//const port = process.env.port || 8080;


// CORS
// block all incoming http requests from non permitted hosts
// var whitelist = ['http://localhost', 'http://127.0.0.1', 'http://localhost:8080']
var corsOptions = {
  origin: function (origin, callback) {
    //if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
  //  } else {
  //    var err = new Error('Express: Not allowed by CORS')
  //    logger.error(err);
  //    callback(err);
  //  }
  }
}
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', indexRouter); 

// Error handling
app.use(function(req, res, next) { 
    var err = new Error('Not Found');
    logger.error('Express: Not Found error');
    logger.error(err);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  logger.error('Express: Server error');
  logger.error(err);
  res.json({
    error: {
      status: (err.status || 500),
      message: err.message
    } 
  });
});

// Heroku debug
app.listen(process.env.port || 3000, () => {

  // HEROKU DEBUG
  console.log("Express CORS-enabled RESTful Service up and running!");
  console.log("We are live on " + process.env.port || 3000);

  logger.info("Express CORS-enabled RESTful Service up and running!");
  logger.info("We are live on " + process.env.port || 3000);
});

module.exports = app;