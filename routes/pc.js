var express = require('express');
var app = express.Router();
var mysql = require('./mysql');
var connection = mysql.connect();

app.get('/main', function (req, res, next) {
  console.log(" main페이지 접속");



  res.render('main');

});
/*
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
*/
/*
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
});*/
/*
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
});*/
app.get('/reservation',function(req,res){
  res.render('reservation');
});
app.get('/register',function(req,res){
  res.render('register');
});
app.post('/register',function(req,res){
  var id = req.body.userid;
  var pw = req.body.userpw;
  var name = req.body.username;
  var birth = req.body.birth;
  var email = req.body.email;
  var phone = req.body.phone;
if(id.length < 6 ){
  console.log("REGISTER REFUSED :: ID Length");
  res.send("<script>alert('아이디는 6글자 이상으로 입력해 주세요!');window.history.back();</script>")
}
if(pw.length < 8){
  console.log("REGISTER REFUSED :: PW Length");
  res.send("<script>alert('비밀번호는 8글자 이상으로 입력해 주세요!');window.history.back();</script>")
}
if(name.length == 0 || name[0] == ' '){
  console.log("REGISTER REFUSED :: NAME Length");
  res.send("<script>alert('올바른 이름을 입력해 주세요!');window.history.back();</script>")
}


connection.query(`SELECT * FROM accounts WHERE userid='${id}'`,function(error,rows,fields){
if(error){
  console.log("REGISTER ERROR"+error);
}else{

if(rows.length == 0){
  connection.query(`INSERT INTO accounts (userid,userpw,username,birth,email,phone) VALUES('${id}','${pw}','${name}','${birth}','${email}','${phone}');`,function(err,row,field){
    if(err){
      console.log("REGISTER ERROR !! : "+err);
      res.send("<script>alert('회원가입에 실패했습니다!'); location.href='/pc/register';</script>");
    }else{
      console.log(id+"님 회원가입 완료");
      res.send("<script>alert('회원가입에 성공했습니다!'); location.href='/pc/table_waiting';</script>");
    }
  });
}else{
  console.log("REGISTER ERROR :: 중복 아이디");
  res.send("<script>alert('이미 존재하는 아이디 입니다!'); window.history.back(); </script>");
}
}
});




});
/*
app.get('/add_reservation', function (req, res) {
  var id = req.cookies.userid;
  connection.query(`INSERT INTO waiting (usernumber,status) VALUES('${id}','0')`, function (err, row, field) {
    //connection.query(`INSERT INTO waiting (usernumber,status) VALUES('${id}','0')`,function(err,row,field){
    if (err) {
      console.log(err);
    }
    res.send(`대기열에 추가 하였습니다.`)
  });
});*/
app.post('/add_reservation',function(req,res){
  var id= req.body.userid;
  var pw= req.body.userpw;
  var part=req.body.part;
  connection.query(`SELECT * FROM accounts WHERE userid='${id}' AND userpw='${pw}';`,function(err,rows,fields){
    if(rows.length == 0){
      res.send(`<script>alert('로그인 정보가 일치하지 않습니다.'); location.href='/pc/reservation'</script>`);
    }else{
      connection.query(`INSERT INTO waiting (usernumber,part) VALUES ('${rows[0].id}','${part}');`,function(error,row,field){
        if(row.length==0){
    res.send(`<script>alert('예약에 실패하였습니다.'); location.href='/pc/reservation'</script>`);
        }else{
    res.send(`<script>alert('예약에 성공하였습니다.'); location.href='/pc/reservation'</script>`);
        }
      });
    }
  });
});

app.get('/table_waiting',function(req,res){
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
        res.render('table_waiting', { lists: people, num: num, acc: accounts,timearr: arr,page: pages });

      });


    }
  });



});
app.get('/table_reservation',function(req,res){
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

		//console.log("lists: " + JSON.stringify(people) + "\nacc: " + JSON.stringify(accounts));
        res.render('table_reservation', { lists: people, num: num, acc: accounts });
      });


    }
  })
});

app.get('/login',function(req,res){
  res.render('login');
});
app.get('/analysis_day',function(req,res){
  res.render('analysis_day');
});
app.get('/analysis_time',function(req,res){
  res.render('analysis_time');
});
app.post('/login_admin',function(req,res){
  var userid= req.body.userid;
  var userpw= req.body.userpw;
  connection.query(`SELECT * FROM accounts WHERE userid='${userid}' AND userpw='${userpw}' AND auth='10'`,function(err,row,field){
    if(err){
      console.log("ERROR BY LOGIN_ADMIN");
      res.json({success:false});
    }else{
      if(row.length == 0 ){
        console.log("[관리자페이지] : 로그인실패");
        res.send(500,"<script>alert('로그인 실패'); location.href='/pc/main'</script>");
      }else
      res.redirect('admin_information');
    }
  });

});
app.get('/admin_information',function(req,res){
  connection.query(`SELECT * FROM accounts;`,function(err,row,field){
    if(err)
    console.log("ERROR BY GET-> /admin_information");
    res.render('admin_information',{acc:row});
  });
});
app.get('/admin_reservation',function(req,res){
  connection.query(`SELECT * FROM accounts`,function(err,row,field){
  if(err)
    console.log("ERROR BY GET-> /admin_reservation");
  connection.query(`SELECT * FROM reservation`,function(error,rows,fields){
    if(error)
    console.log("ERROR BY GET-> /admin_reservation");
    res.render('admin_reservation',{acc:row,list:rows});
  });
  });
});
app.get('/set_condition_0_:id',function(req,res){
var id = req.params.id;
    connection.query(`UPDATE waiting SET status = 0 WHERE id='${id}'`,function(err,row,field){
      if(err){
        console.log("set_condition_failed");
      }else{
        res.send(`<script>location.href='/pc/admin_waiting';</script>`);
      }
    });


});
app.get('/set_condition_1_:id',function(req,res){
var id = req.params.id;
    connection.query(`UPDATE waiting SET status = 1 WHERE id='${id}'`,function(err,row,field){
      if(err){
        console.log("set_condition_failed");
      }else{
        res.send(`<script>location.href='/pc/admin_waiting';</script>`);
      }
    });


});

app.get('/set_condition_2_:id',function(req,res){
var id = req.params.id;
    connection.query(`UPDATE waiting SET status = 2 WHERE id='${id}'`,function(err,row,field){
      if(err){
        console.log("set_condition_failed");
      }else{
        res.send(`<script>location.href='/pc/admin_waiting';</script>`);
      }
    });


});

app.get('/admin_waiting',function(req,res){
  connection.query(`SELECT * FROM accounts;`,function(err,row,field){
    if(err)
    console.log("ERROR BY GET -> /admin_waiting");
    connection.query(`SELECT * FROM waiting`,function(error,rows,fields){
      if(error)
        console.log("ERROR BY GET -> /admin_waiting");
      res.render('admin_waiting',{acc:row,list:rows});
    });
  });
})
app.get('/admin_answer',function(req,res){
  res.render('admin_answer');
});
app.post('/information_edit',function(req,res){
  var id= req.body.id;
  connection.query(`UPDATE accounts SET userid= '${req.body.userid}', userpw= '${req.body.userpw}', username='${req.body.username}', birth='${req.body.birth}', email='${req.body.email}',auth='${req.body.auth}', phone='${req.body.phone}' WHERE id = '${id}'`,function(err,row,field){
 if(err){
        console.log("edit failed");
      }else{
        res.send(`<script>location.href='/pc/admin_information';</script>`);
      }
  } );
});
app.get('/clinic_end_:id',function(req,res){
	var num = req.params.id;
	connection.query(`SELECT id FROM waiting WHERE status<'2'`,function(err,row,field){
		if(!err){
			connection.query(`UPDATE waiting SET status= '2' WHERE id='${row[req.params.id].id}';`,function(error,rows,fields){
				if(!error){
					console.log(`UPDATE waiting SET status= '2' WHERE id='${row[req.params.id].id}';`);

						connection.query(`UPDATE waiting SET clinic_start= NOW() WHERE status ='0' limit 1;`,function(error2,row2,field2){
								connection.query(`UPDATE waiting SET clinic_end= NOW() WHERE id='${row[req.params.id].id}';`,function(error3,row3,field3){
										connection.query(`UPDATE waiting SET status= '1' WHERE status = '0' limit 1`,function(error4,rows4,fields4){
											res.send(`<script>location.href='/pc/table_waiting';</script>`);
										});
								});
						});
				}
			});
		}
	});
});
module.exports = app;
