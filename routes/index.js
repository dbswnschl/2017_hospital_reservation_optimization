var express = require('express');
var app = express.Router();

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Hospital_Service_Server' });
});

module.exports = app;
