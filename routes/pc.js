var express = require('express');
var app = express.Router();
var mysql = require('./mysql');
var connection = mysql.connect();

app.get('/main', function (req, res, next) {
  console.log(" main페이지 접속");



  res.render('main');

});
app.get('/table', function (req, res) {
  var arr = new Array();
  connection.query(`SELECT * FROM reservation WHERE status = '0' OR status = '1';`, function (error, row, field) {
    if (error) {
      console.log("[ERROR:table 01]\n" + error);
      res.send(error);
    } else {
      var num = row.length;
      var people = row;
      connection.query(`SELECT * FROM accounts ;`, function (err, rows, field) {
        if (err) {
          console.log(err);
          res.send(err);
        }
        var accounts = rows;

        res.render('table', { lists: people, num: num, acc: accounts });
      });


    }
  });
});
app.get('/table2/:pages', function (req, res) {
  var arr = new Array();
  var pages = req.params.pages;
  connection.query(`SELECT * FROM waiting WHERE status = '0' OR status = '1';`, function (error, row, field) {
    if (error) {
      console.log("[ERROR:table2 01]\n" + error);
      res.send(error);
    } else {
      var num = row.length;
      var people = row;
      connection.query(`SELECT * FROM accounts ;`, function (err, rows, field) {
        if (err) {
          console.log(err);
          res.send(err);
        }
        var accounts = rows;
        for (var i = 0; i < people.length; i++) {
          arr[i] = (people[i].wanttime + "").split(' ');
          switch (arr[i][1]) {
            case "January":
              arr[i][1] = "01";
              break;
            case "February":
              arr[i][1] = "02";
              break;
            case "March":
              arr[i][1] = "03";
              break;
            case "Apr":
              arr[i][1] = "04";
              break;
            case "May":
              arr[i][1] = "05";
              break;
            case "June":
              arr[i][1] = "06";
              break;
            case "July":
              arr[i][1] = "07";
              break;
            case "August":
              arr[i][1] = "08";
              break;
            case "September":
              arr[i][1] = "09";
              break;
            case "October":
              arr[i][1] = "10";
              break;
            case "November":
              arr[i][1] = "11";
              break;
            case "December":
              arr[i][1] = "12";
              break;
          }
        }
        res.render('table2', { lists: people, num: num, acc: accounts,timearr: arr,page: pages });

      });


    }
  });
});
app.get('/reservation', function (req, res) {
  connection.query(`SELECT * FROM accounts WHERE id = '${req.cookies.userid}'`, function (err, rows, fields) {

    if (err) {
      console.log(err);
      res.send(err);
    }
    else {
      console.log("DEBUG 01");
      console.log(rows.length);
      if (rows.length > 0) {
        //  if(req.cookies.token == rows[0].token){
        connection.query(`SELECT * FROM reservation WHERE status='0' `, function (error, row, field) {
          if (error) {
            console.log(error);
            res.send(error);
          }
          else {
            var people = row.length + "";
            res.render('reservation', { waiting: people });
          }
        });

        //    }
      }
      else {
        res.send('cookie값을 가져오는데 실패');
      }
    }
  });
});
app.get('/add_reservation', function (req, res) {
  var id = req.cookies.userid;
  connection.query(`INSERT INTO waiting (usernumber,status) VALUES('${id}','0')`, function (err, row, field) {
    //connection.query(`INSERT INTO waiting (usernumber,status) VALUES('${id}','0')`,function(err,row,field){
    if (err) {
      console.log(err);
    }
    res.send(`대기열에 추가 하였습니다.`)
  });
});
module.exports = app;