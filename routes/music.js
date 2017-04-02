var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var app_member = {};

router.get('/', function(req, res, next) {
  res.render('login', { title: 'SSP Music Database' });
});

router.get('/signup', function(req, res, next){
    res.render('signup')
});
router.get('/login', function(req, res, next){
    res.render('login')
});
router.get('/home', function(req, res, next){
    res.render('home')
});


var pool  = mysql.createPool({
  connectionLimit : 100, //important
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'SSP'
});

pool.getConnection(function(err, connection) {
  connection.query('SELECT * from users', function (error, results, fields) {
    console.log(results[0].email, results[0].fName);
    connection.release();

    if (error) throw error;
    // Don't use the connection here, it has been returned to the pool. 
  });
});

router.post('/signup', function(req, res, next){
    
  app_member.id = req.body.id;
  app_member.email = req.body.newUsername;
  app_member.pword = req.body.newPassword;
  app_member.fName = req.body.newFname;

    pool.getConnection(function(err, connection) {
connection.query('INSERT INTO users (email, pword, fName) VALUES(?,?,?)',[app_member.email, app_member.pword, app_member.fName], function(err, results,fields) {
    if (err) {
      throw err;
    }

    // notice that results.insertId will give you the value of the AI (auto-increment) field
    app_member.id = results.insertId;
    console.log(JSON.stringify(app_member));

    // Close the connection and make sure you do it BEFORE you redirect
    connection.release();

    res.redirect('/login');
    //res.send('Success! Please log in');
  });
   });
    
});

router.post('/login', function(req, res, next){
    
 app_member.id = req.body.id;
 app_member.email = req.body.username;

    pool.getConnection(function(err, connection) {
    connection.query('SELECT email, pword FROM users WHERE email=?',[app_member.email],function(err, results,fields) {
    if (err) {
      throw err;
    }
    
    else if (results.length) { 
    console.log('The result is  ', results[0].email);
    } else {
    console.log("Query didn't return any results");
    }
    app_member.id = results.insertId;

    var givenUsername = req.body.username;
    var givenPassword = req.body.password;

    console.log(JSON.stringify(app_member));

    // Close the connection and make sure you do it BEFORE you redirect
    connection.release();

      if (results.length == 0) {
        res.redirect('/login')
      } 

      else if(givenPassword != results[0].pword){
          console.log("wrong password")
          res.redirect('/login')
      }
      else{
          res.redirect('/home')
           sess=req.session;
           sess.sessdata = {};
           sess.sessdata.email= results[0].email;
      }
      console.log(sess.sessdata.email +' session email')
    
  });
 });
    
});


module.exports = router;
