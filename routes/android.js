var express = require('express');
var app = express.Router();
var mysql = require('./mysql');
console.log("ABCDEFG");
var connection = mysql.connect();
var FCM = require('fcm-node');
var serverKey = "AIzaSyAv8u2gITuRPBipeW9aEQ-K-yTV3zxLNmA"; //인증키
var fem = new FCM(serverKey);
var reservationManager = require('../public/libs/ReservationManager').ReservationManager;

var message = {
  to: '', //기기 토큰값
  notification: {
    title: 'this is title',//제목
    body: 'message to phone' //보낼 메시지
  },
};
/* GET home page. */

app.get('/get_reservation', function (req, res) {
  connection.query(`SELECT id, username FROM accounts`, function (error, rows, fields) {
    connection.query(`SELECT * FROM reservation`, function (err, row, field) {
      var id1 = new Array();
      var name1 = new Array();
      var reservationtime1 = new Array();
      var status1 = new Array();
      for (var i = 0; i < row.length; i++) {
        reservationtime1.push(row[i].reservationtime);
        status1.push(row[i].status);
        id1.push(row[i].usernumber);
        name1.push(rows[row[i].usernumber].username);
      }
      var result = new Array();
      for (var i = 0; i < row.length; i++) {
        result.push({
          id: id1[i], name: name1[i], reservationtime: reservationtime1[i], status: status1[i]
        });
      }
      var response = { response: result };
      res.json(response);
    });
  });
});
app.get('/get_waiting', function (req, res) {
  connection.query(`SELECT id,username FROM accounts`, function (error, rows, fields) {

    connection.query(`SELECT * FROM waiting`, function (err, row, field) {
      var waiting_table = row;
      var account_table = rows;
      var id1 = new Array();
      var name1 = new Array();
      var wanttime1 = new Array();
      var status1 = new Array();
      for (var i = 0; i < row.length; i++) {
        wanttime1.push(row[i].wanttime);
        status1.push(row[i].status);
        id1.push(row[i].usernumber);
        name1.push(rows[row[i].usernumber].username);
      }
      console.log(id1);
      console.log(name1);
      var result = new Array();
      for (var i = 0; i < row.length; i++) {
        result.push({
          id: id1[i], name: name1[i], wanttime: wanttime1[i], status: status1[i]
        });
      }
      var response = { response: result };
      console.log(response);
      res.json(response);
    });
  });
});

/* POST home page. */

app.post('/add_reservation', function (req, res) {
  var id = req.body.userID;
  var purpose = req.body.userPurpose;
  var day = req.body.bookDay;
  var month = req.body.bookMonth;
  var year = req.body.bookYear;
  var bookTime = req.body.bookTime;
  var response = { success: true };
  var dt = year + "-" + month + "-" + day + " " + bookTime;
  connection.query(`SELECT * FROM accounts WHERE userid = '${id}'`, function (err, row, field) {
    if (!err) {
      if (row.length == 1) {
        connection.query(`INSERT INTO reservation (usernumber,part,reservationtime,status) VALUES('${row[0].id}','${purpose}','${dt}','0')`, function (err2, row2, field2) {
          //connection.query(`INSERT INTO waiting (usernumber,status) VALUES('${row[0].id}','0')`, function(err2,row2,field2){
          if (!err) {
            console.log(`INSERT INTO reservation (usernumber,part,reservationtime,status) VALUES('${row[0].id}','${purpose}','${dt}','0')`);
            console.log("[디버그]예약성공");

            reservationManager.addReservation(id, dt);

            res.json(response);
            console.log("reservation success");
          }

        });
      }
    }
  });
});
app.post('/main/information', function (req, res) {
  var id = req.body.userid;
  var info;
  connection.query(`SELECT * FROM accounts WHERE id = '${id}'`, function (err, row, field) {
    if (!err) {
      info = JSON.stringify(row);
      res.json(info);

    }
  });
});
app.post('/reservationing', function (req, res) {
  var id = req.body.userid;
  connection.query(`INSERT INTO reservation (usernumber,status) VALUES('${id}','0')`, function (err, row, field) {
    if (err) console.log(err);
    res.send('success');
  });
});

app.post('/get_history', function (req, res) {
  var userid = req.body.userid;
  connection.query(`SELECT * FROM accounts WHERE userid='${userid}';`, function (error, rows, fields) {
    if (error) {
      console.log("[ERROR01] " + error);

      res.send(error);
    }
    var id = rows[0].id;
    connection.query(`SELECT * FROM waiting WHERE usernumber='${id}' AND status='3'`, function (err, row, field) {
      if (err) {
        console.log("[ERROR02] " + err);
        res.send(err);
      }

      var wanttime1 = new Array();
      var purpose1 = new Array();
      var result = new Array();
      for( var i = 0 ; i < row.length ; ++i){
        result.push({
          wanttime:row[i].wanttime,
          purpose:row[i].part
        });
      }

      var response = { response : result } ;	

      console.log(response);
      res.json(response);
    });
  });
});
app.post('/get_account', function (req, res) {
  var userid = req.body.userid;
  connection.qurey(`SELECT * FROM accounts WHERE userid='${userid}';`, function (error, rows, fields) {
    if (error) {
      console.log(error);
      res.send(error);
    }
    connection.query(`SELECT * FROM reservation WHERE userid='${rows[0].id}'`, function (err, row, field) {
      if (err) {
        console.log(err);
        res.send(err);
      }
      var result = { number: rows[0].id, name: rows[0].username, status: row[0].status, success: true };
      res.send(result);
    });
  });
});
app.post('/check_reservation',function(req,res){
  var userid = req.body.userid;
  var usernumber;
  connection.query(`SELECT id, username FROM accounts WHERE userid='${userid}'`, function (error, rows, fields) {
    usernumber = rows[0].id;
    connection.query(`SELECT * FROM reservation WHERE usernumber='${usernumber}'`, function (err, row, field) {
      var id1 = new Array();
      var name1 = new Array();
      var reservationtime1 = new Array();
      var status1 = new Array();
      var purpose1 = new Array();
      for (var i = 0; i < row.length; i++) {
        reservationtime1.push(row[i].reservationtime);
        status1.push(row[i].status);
        id1.push(row[i].usernumber);
        name1.push(row[i].username);
        purpose1.push(row[i].part);
      }
      var result = new Array();
      for (var i = 0; i < row.length; i++) {
        result.push({
          id: id1[i], name: name1[i], reservationtime: reservationtime1[i], status: status1[i], purpose:purpose1[i]
        });
      }
	var response = { response : result };
	console.log(response);
    res.json(response);
    });
  });
});
app.post('/beacon_connect',function(req,res){
  var userid = req.body.userid;
  var uuid = req.body.uuid;
  var tf = false;
  var id ;
  console.log(userid);
  console.log(uuid);
  connection.query(`SELECT * FROM accounts WHERE userid='${userid}'`,function(error,rows,fields){
    if(error){
      console.log(error);
      res.send(error);
    }
    id = rows[0].id;
  connection.query(`SELECT * FROM beacon ;`,function(err,row,field){
    if(err){
      console.log(err);
      res.send(err);
    }
//    for(var i in row){
      for(var i = 0 ; i < row.length ; i++){
      if(uuid == row[i].UUID){
        tf = true;
        console.log(row[i].UUID);
      }
    }
    if(tf == false){
      console.log("Not correct UUID!");
      res.send("Not correct UUID!");
    }
    else{
      console.log(`INSERT INTO waiting (usernumber,status) VALUES('${id}','0')`);
      connection.query(`INSERT INTO waiting (usernumber,status) VALUES('${id}','0')`, function(err1,row1,field1){
        if(err1) {
          console.log(err1);
          res.send(err1);
        }
        console.log(`DELETE FROM reservation WHERE usernumber='${id}';`);
  connection.query(`DELETE FROM reservation WHERE usernumber='${id}';`,function(err2,row2,field2){
    if(err2){
      console.log(err2);
      res.send(err2);
    }


    res.send({success:true});
      });
  });
  }
 });
});
});
app.post('/test', function (req, res) {
  var token = req.body.token;
  message.to = token;
  FCM.send(message, function (err, response) {
    if (err) {
      console.log("Fialed sent, ", err);
      res.send(err);
    } else {
      console.log("Success sent, res: ", response);
      res.send({ success: true });
    }
  });



});


module.exports = app;
