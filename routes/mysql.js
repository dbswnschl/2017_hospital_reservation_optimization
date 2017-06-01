var express = require('express');
var mysql = require('mysql');
var app = express();

var reservationManager = require('../public/libs/ReservationManager').ReservationManager;

exports.connect = function(){
  var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'hospital',
  port: '3307'
});

connection.connect();
return connection;
}
var connection = exports.connect();
connection.query('SELECT * FROM `accounts`', function (err, rows, fields) {
  if (err) {
    console.log(err);
  }
  console.log('*계정서버 연동완료*');

    // start reservation manager
    reservationManager.startObserver();

});