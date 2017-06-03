var express = require('express');
var app = express.Router();
var mysql = require('./mysql');
var connection = mysql.connect();

/* POST ROUTER */
app.post('/login_validate', function (req, res) {
  var userid = req.body.userid;
  connection.query(`SELECT * FROM accounts WHERE userid = ${userid}`, function (err, row, field) {
    if (err)
      res.send(err);
    if (row.length == 0) {

      var response = { success: true };
      res.json(response);
    }
  });
});
app.post('/login', function (req, res, next) {
  var userid = req.body.userid;
  var userpw = req.body.userpw;
  var sql = 'SELECT * FROM accounts where userid="' + userid + '" AND userpw="' + userpw + '";';
  connection.query(sql, function (err, rows, fields) {
    if (err) {
      console.log(err);
    }
    if (rows.length > 0) {
      res.cookie('userid', rows[0].id);
      username = rows[0].username;
      var userbirth = new Date(rows[0].birth);
      var dd = userbirth.getDate();
      var mm = userbirth.getMonth() + 1;
      var yyyy = userbirth.getFullYear();
      if (dd < 10) {
        dd = '0' + dd
      }
      if (mm < 10) {
        mm = '0' + mm
      }

      userbirth = yyyy + "-" + mm + "-" + dd;
      console.log(userbirth)
      console.log(rows[0].username + ' 로그인성공');
      var response = { success: true, name: rows[0].username, birth: userbirth, phone: rows[0].phone };
      console.log(response);
      try {
        if (eval(req.body.isphone)) {
          res.json(response);
          return;
        }
      } catch (exc) {
        console.log("Login성공하여 main으로");
      }
      res.send(`<script>location.href='/pc/main'</script>`);
    }
    else {

      var response = { success: false };
      res.json(response);
    }
  });
});
app.post('/mobile/register_validate', function (req, res) {
  connection.query(`SELECT id FROM accounts WHERE userid="${req.body.userid}"`, function (err, rows, fields) {
    if (err)
      console.log(err);
    if (rows.length > 0) {
      var response = { success: false };
      console.log(response);
      res.json(response);
    }
    else {
      var response = { success: true };
      console.log(response);
      res.json(response);
    }
  });
});

app.post('/register', function (req, res) {
  console.log(`${req.body.userid} register Checking...`);


  connection.query(`SELECT id FROM accounts WHERE userid="${req.body.userid}"`, function (err, rows, fields) {
    if (err) {
      res.send(err);
    }
    if (rows.length > 0) {
      var response = { success: false };
      res.json(response);
    } else {

      var birth = req.body.birth;
      var phone = req.body.phone;
      console.log(phone);
      connection.query(`INSERT INTO accounts (userid,userpw,username,birth,email,phone) VALUES ('${req.body.userid}','${req.body.userpw}','${req.body.username}','${birth}','${req.body.email}','${phone}');`, function (err, rows, fields) {
        if (err)
          res.send(err);

        else {
          var response = { success: true };
          res.json(response);
          console.log("가입완료");
          res.render('login');
        }

      });
    }
  });
});
module.exports = app;