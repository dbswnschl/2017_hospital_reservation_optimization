var express = require('express');
var app = express.Router();
var mysql = require('./mysql');
console.log("ABCDEFG");
var connection = mysql.connect();
var FCM = require('fcm-node');
var serverKey = "AAAABRO0LPk:APA91bETaNZ7lTnXpnX6dJChFXXMCp5nLvDkvrBblyqKNzP-vKWNawRsXTU3ab4wAvA2E7PMAj7UG07tCSVJtHSmCuSaU4TM-lAkaQstzUsPJVufeQ1PsqNUqPBNdXiC29mj3ZFsOURP";
//var serverKey="AAAAHGN2-WM:APA91bHBAYCPwHiEAjNCA-HPeTFXxDXObw7DAYheQnr_hEFZJBh6b8-TXR_B47w0ygYC99l1EnrUcWj-vpByX9h8h3yBcL4dksSmd7hvHvvMLjwCYCSXCndeWOkIGloyO0W_bKyWb4IK";
//var serverKey = "AIzaSyAv8u2gITuRPBipeW9aEQ-K-yTV3zxLNmA"; //인증키
var reservationManager = require('../public/libs/ReservationManager').ReservationManager;
var fem = new FCM(serverKey);
var message = {
  to: '', //기기 토큰값
  notification: {
    title: '테스트로 보내는 알림입니다.',//제목
    body: '테스트 메시지 입니다.' //보낼 메시지
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
        name1.push(rows[row[i].usernumber - 1].username);
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
        wanttime1.push(String(row[i].wanttime).split(' ')[4]);
        status1.push(row[i].status);
        id1.push(row[i].usernumber);
        name1.push(rows[row[i].usernumber-1].username);
      }
      console.log(id1);
      console.log(name1);
      var result = new Array();
      for (var i = 0; i < row.length; i++) {
        result.push({
        name: name1[i], wanttime: wanttime1[i],
        });
      }
      var response = { response: result };
      console.log(response);
      res.json(response);
    });
  });
});

/* POST home page. */

app.post('/test1', function (req, res){

var userID = req.body.userID;
var userName = req.body.userName;
var userBirth = req.body.userBirth;
var year = req.body.Year;
var month = req.body.month;
var day = req.body.day;
var time = req.body.time;
var min = req.body.min;
var memo = req.body.memo;
var response = {success:true};
console.log(userID+userName+userBirth);
res.json(response);
});

app.post('/add_reservation', function (req, res) {
  var id = req.body.userID;
  var memo = req.body.userPurpose;
  var day = req.body.bookDay;
  var month = req.body.bookMonth;
  var year = req.body.bookYear;
  var bookTime = req.body.bookTime;
  var minute = req.body.bookMin ;
  var userbirth = req.body.userbirth;
  var userName  = req.body.userName;
  var peoples;
  var response = { success: true };
  var dt = year + "-" + month + "-" + day + " " + bookTime;

  if (String(month).length < 2)
    month = "0" + month;
  if (String(day).length < 2)
    day = "0" + day;
  

  connection.query(`SELECT * FROM accounts WHERE userid = '${id}'`, function (err, row, field) {
    if (!err) {
      if (row.length == 1) {
        connection.query(`INSERT INTO reservation (usernumber,part,reservationtime,status) VALUES('${row[0].id}','${memo}','${dt}','0')`, function (err2, row2, field2) {
          //connection.query(`INSERT INTO waiting (usernumber,status) VALUES('${row[0].id}','0')`, function(err2,row2,field2){
          if (!err) {
            console.log(`INSERT INTO reservation (usernumber,part,reservationtime,status) VALUES('${row[0].id}','${memo}','${dt}','0')`);
            console.log("[디버그]예약성공");

            /*
                        //fcm

                        msg = {
                          to: 'cMPRImpPAhw:APA91bG_IzIEr6il4V2xRjIF0YX7QLsjRtDbDqcMgQSyyYz9-Cc-WKWJhQY395Fr6ZlNf8udAYIA39LC-UkSt9FNM6anAz6cX24x1EJakEBMMzyxSnZXpXY0hdzMDaPYlRSrjsT2kSFz', //기기 토큰값
                          notification: {
                            title: '예약알림.',//제목
                            body: '예약이'+peoples+"개 남았습니다." //보낼 메시지
                          }
                        };
                        fem.send(msg, function (err2, response2) {
                          if (err) {
                            console.log("Fialed sent, ", err2);
                            res.send(err2);
                          } else {
                            console.log(msg);
                            console.log("Success sent, res: ", response2);
                            //res.send({ success: true });
                          }
                        });
                        //fcm
                        */

            console.log("reservation success");
            reservationManager.addReservation(row[0].id, dt);
             res.json(response);


          }

        });
      }
    }
  });
});
app.post('/main/information', function (req, res) {
  
  
  var id = req.body.userid
  
  
  var info;
  connection.query(`SELECT * FROM accounts WHERE id = '${id}'`, function (err, row, field) {
    if (!err) {
      info = JSON.stringify(row);
      //res.json(info);

    }
  });
});
/*
app.post('/account_edit', function (req, res) {
  
  
  var id = req.body.userid
  var name = req.body.userName;
  var number = req.body.userNumber;
  var birth = req.body.userBirth;
  
  response = { "success" : true };

console.log(id);
console.log(name);
console.log(number);
console.log(birth);
  
  connection.query(`SELECT * FROM accounts WHERE id = '${id}'`, function (err, row, field) {
    if (!err) {

		if(!(row.length == 0) ){

connection.query(`UPDATE accounts SET username = 'name' , birth = 'birth', phone = 'number'
	WHERE id = '${id}'` , function (err, row, field) {
    if (!err) {

      

    }
  });
});

*/

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
    connection.query(`SELECT * FROM waiting WHERE usernumber='${id}' AND status='2'`, function (err, row, field) {
      if (err) {
        console.log("[ERROR02] " + err);
        res.send(err);
      }

      var wanttime1 = new Array();
      var purpose1 = new Array();
      var result = new Array();
      for (var i = 0; i < row.length; ++i) {
        result.push({
          wanttime: row[i].wanttime,
          purpose: row[i].part
        });
      }

      var response = { response: result };

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
app.post('/check_reservation', function (req, res) {
  var userid = req.body.userid;
  var usernumber
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
          id: id1[i], name: name1[i], reservationtime: reservationtime1[i], status: status1[i], purpose: purpose1[i]
        });
      }
      var response = { response: result };
      console.log(response);
      res.json(response);
    });
  });
});
app.post('/beacon_connect', function (req, res) {
  var userid = req.body.userid;
  var uuid = req.body.uuid;
  var token = req.body.userToken;
  var tf = false;
  var id;
  var reserved_time;
  var part;
  var rowid;
  var reservation_id;
  console.log(userid);
  console.log(uuid);
  console.log(token);
  connection.query(`SELECT * FROM accounts WHERE userid='${userid}'`, function (error, rows, fields) {
    if (error) {
      console.log(error);
      res.send(error);
    }
    id = rows[0].id;
    connection.query(`SELECT * FROM beacon ;`, function (err, row, field) {
      if (err) {
        console.log(err);
        res.send(err);
      }
      //    for(var i in row){
      for (var i = 0; i < row.length; i++) {
        if (uuid == row[i].UUID) {
          tf = true;
          console.log(row[i].UUID);
        }
      }
      if (tf == false) {
        console.log("Not correct UUID!");
        res.send("Not correct UUID!");
      }
      else {
        connection.query(`SELECT * FROM reservation WHERE usernumber='${id}'`, function (err_reservation, rows_reservation, fields_reservation) {
          if (err_reservation) {
            console.log("예약 정보를 찾을 수 없음");
            res.send("예약 정보를 찾을 수 없습니다.");
          } else {
          console.log("[디버깅모드]");
            console.log("usernumber="+id);
          console.log(rows_reservation);
            if(rows_reservation.length > 0){
            reserved_time = rows_reservation[0].reservationtime;
            part = rows_reservation[0].part;
            rowid = rows_reservation[0].usernumber;
            reservation_id = rows_reservation[0].id;



        connection.query(`INSERT INTO waiting (usernumber,status,reserved_time,token,part) VALUES('${rowid}','0','${reserved_time}','${token}','${part}')`, function (err1, row1, field1) {
          if (err1) {
            console.log(err1);
            res.send(err1);
          }
          connection.query(`DELETE FROM reservation WHERE id='${reservation_id}';`, function (err2, row2, field2) {
            if (err2) {
              console.log(err2);
              res.send(err2);
            }

           var response = { success : true};
            res.json(response);
          });
        });

      }
      }

                });



      }
    });
  });
});
app.post('/test', function (req, res) {
  var token = req.body.token;
  message.to = token;
  fem.send(message, function (err, response) {
    if (err) {
      console.log("Fialed sent, ", err);
      res.send(err);
    } else {
      console.log("Success sent, res: ", response);
      res.send({ success: true });
    }
  });



});
app.get('/gettoken', function (req, res) {
  var idtoken;
  fem.auth().currentUser.getToken(true).then(function (idtoken) {
    res.send(idtoken);
  }).catch(function (err) {

  });
});

var msg = {
  to: 'cMPRImpPAhw:APA91bG_IzIEr6il4V2xRjIF0YX7QLsjRtDbDqcMgQSyyYz9-Cc-WKWJhQY395Fr6ZlNf8udAYIA39LC-UkSt9FNM6anAz6cX24x1EJakEBMMzyxSnZXpXY0hdzMDaPYlRSrjsT2kSFz', //기기 토큰값
  notification: {
    title: '예약알림',//제목
    //body: '예약이' + get_count() + "개 남았습니다." //보낼 메시지
  }
};
app.get('/alert/count', function (req, res) {

  connection.query(`SELECT * FROM reservation`, function (err, row, field) {
    msg.notification.body = "예약이";
    msg.notification.body += row.length;
    msg.notification.body += "개 남았습니다.";
    fem.send(msg, function (err, response) {
      if (err) {
        console.log("Fialed sent, ", err);
        res.send(err);
      } else {
        console.log(msg);
        console.log("Success sent, res: ", response);
        res.json({ success: true });
      }
    });
  });
});
app.post('/alert/count', function (req, res) {
  var token = req.body.token;
  if(token){
    msg.to = token;
  }else{
    msg.to = 'cMPRImpPAhw:APA91bG_IzIEr6il4V2xRjIF0YX7QLsjRtDbDqcMgQSyyYz9-Cc-WKWJhQY395Fr6ZlNf8udAYIA39LC-UkSt9FNM6anAz6cX24x1EJakEBMMzyxSnZXpXY0hdzMDaPYlRSrjsT2kSFz';
  }
  connection.query(`SELECT * FROM reservation`, function (err, row, field) {
    msg.notification.body = "예약이";
    msg.notification.body += row.length;
    msg.notification.body += "개 남았습니다.";
    fem.send(msg, function (err, response) {
      if (err) {
        console.log("Fialed sent, ", err);
        res.send(err);
      } else {
        console.log(msg);
        console.log("Success sent, res: ", response);
        res.json({ success: true });
      }
    });
  });
});

app.post('/alert/success', function (req, res) {
  var token = req.body.token
  var msg = {
    to: token, //기기 토큰값
    notification: {
      title: '동네병원',//제목
      body: '진료 접수가 완료되었습니다.' //보낼 메시지
    }
  };

  fem.send(msg, function (err, response) {
    if (err) {
      console.log("Fialed sent, ", err);
      res.send(err);
    } else {
      console.log("Success sent, res: ", response);
      res.send({ success: true });
    }
  });
});

app.get('/alert', function (req, res) {
  var msg = {
    //to: 'cMPRImpPAhw:APA91bG_IzIEr6il4V2xRjIF0YX7QLsjRtDbDqcMgQSyyYz9-Cc-WKWJhQY395Fr6ZlNf8udAYIA39LC-UkSt9FNM6anAz6cX24x1EJakEBMMzyxSnZXpXY0hdzMDaPYlRSrjsT2kSFz', //기기 토큰값
    to:'c_FWdMCzUIQ:APA91bF_uKlMLCTbE8m7ZNef0KqLmJHQY07dZ0hYYawPc4nDLsxOAQXibU3snJAiiAE7cjjAJxu46om4hc_1uVsnKTtqvAztAZpRGRPA7QPrQ46jUWJbytoAaoi54lKkwOnz7hB-DZDu',
    notification: {
      title: '테스트로 보내는 알림입니다.',//제목
      body: '테스트 메시지 입니다.' //보낼 메시지
    }
  };

  fem.send(msg, function (err, response) {
    if (err) {
      console.log("Fialed sent, ", err);
      res.send(err);
    } else {
      console.log("Success sent, res: ", response);
      res.send({ success: true });
    }
  });
});
var get_count = function () {
  console.log(row.length + "명");
  return String(row.length);


}
app.post('/check_waiting_count',function(req,res){
  var userid = req.body.userid;
  console.log("userid="+userid);
  var usernumber;
  var count;
  var token;
  connection.query(`SELECT * FROM accounts WHERE userid=${'userid'}`,function(err,row,field){
    usernumber = row[0].id;
    console.log("usernumber="+usernumber);
  });
  connection.query(`SELECT * FROM waiting WHERE status=0`,function(err,row,field){
    for(var i = 0 ; i < row.length ; i ++){
      if(row[i].usernumber == usernumber){
        count=i+1;
        msg.to=row[i].token;
        break;
      }
    }
    console.log("usernumber="+usernumber);
    msg.notification.body = "대기번호";
    msg.notification.body += count;
    msg.notification.body += "번 입니다!";
    fem.send(msg, function (err, response) {
      if (err) {
        console.log("Fialed sent, ", err);
        res.send(err);
      } else {
        console.log(msg);
        console.log("Success sent, res: ", response);
        res.json({ success: true });
      }
    });
  });
});

module.exports = app;
