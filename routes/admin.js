var express = require('express');
var mysql = require('mysql');

var router = express.Router();


var dbConnectionInfo = {
  host : 'localhost',
  user : 'root',
  password : '',
  database : 'SSP'
};

router.get('/createPlaylist', function(req, res, next) {
  res.render('playlistForm');
});

router.get('/createAudio', function(req, res, next) {
  res.render('audioForm');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/logout', function(req, res, next) {
  req.session.destroy()
  res.redirect('/login');
});

router.get('/signup', function(req, res, next) {
    res.render('signup');
});

var loggedInUserId = '';

var member = {};
router.post('/signup', function(req, res, next) {
   var dbConnection = mysql.createConnection(dbConnectionInfo);
  dbConnection.connect();

    member.id = req.body.id;
    member.name = req.body.newFname;
    member.email = req.body.newUsername;
    member.pword = req.body.newPassword;

        dbConnection.query('SELECT email FROM users', function(err, results, fields) {
            if (err) {
                throw err;
            }
            console.log(JSON.stringify(member));

        var registeredEmails = new Array();

        for (var i = 0; i < results.length; i++) {
            var email = {};
            email.email = results[i].email;

            console.log(JSON.stringify(email));

            registeredEmails.push(email);
        }

        for (var i = 0; i <registeredEmails.length; i++) {
            if(member.email == registeredEmails[i]) {

                res.redirect('/signup');
            console.log('email already in use');
        }
    } 

        dbConnection.query('INSERT INTO users (email, pword, fName) VALUES(?,?,?)', [member.email, member.pword, member.name], function(err, results, fields) {
            if (err) {
                throw err;
            }
            member.id = results.insertId;
            console.log(JSON.stringify(member));
            req.session.email = member.email;
            req.session.name = member.name;
            dbConnection.end();
        
            res.redirect('/login');
        
    });       
  });
 });


router.post('/login', function(req, res, next) {
    var userMessage = req.session.userMessage ? req.session.userMessage : "";
  req.session.userMessage = "";
      var dbConnection = mysql.createConnection(dbConnectionInfo);
    dbConnection.connect();

    member.email = req.body.username;
        dbConnection.query('SELECT email, pword, userId FROM users WHERE email=?', [member.email], function(err, results, fields) {
            if (err) {
                throw err;
            } else if (results.length) {
                console.log('The result is  ', results[0].email);
                member.userId = results[0].userId;
                req.session.email=results[0].email;
                req.session.userId = results[0].userId;
            } else {
                console.log("Query didn't return any results.");
                req.session.userMessage ="This email address is not registered";
            }
            

            var givenUsername = req.body.username;
            var givenPassword = req.body.password;
            console.log(JSON.stringify(member));
            dbConnection.end();
            if (results.length == 0) {
                res.render('login', { msg: userMessage });
            } else if (givenPassword != results[0].pword) {
                console.log("wrong password")
                req.session.userMessage ="Password/email incorrect";
                res.render('login', { msg: userMessage });
            } else {
                res.redirect('/')
            req.session.username = member.email;
            //req.session.userID = member.userId;
          }
              console.log('The session ID is ' + req.session.userID);
    });
});




router.get('/', function(req, res, next) {

    var dbConnection = mysql.createConnection(dbConnectionInfo);
    dbConnection.connect();

    dbConnection.on('error', function(err) {
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
            console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
        } else {
            console.log('Got a DB Error: ', err);
        }
    });

    dbConnection.query('SELECT * FROM playlists where playlistUserId=?',[req.session.userId], function(err, results, fields) {
        if (err) {
            throw err;
        }


          var allPlaylists = new Array();
        for (var i = 0; i < results.length; i++) {
            var playlist = {};
            playlist.id = results[i].playlistId;
            playlist.text = results[i].playlistName;
            playlist.date = new Date(results[i].date);
            playlistId = playlist.id;

            console.log(JSON.stringify(playlist));

            allPlaylists.push(playlist);
        }

        dbConnection.end();

        res.render('playlistList', {
            playlists: allPlaylists
        });

router.get('/playlist:playlistId', function(req, res, next) {
  playlistId = req.params.playlistId;
  playlistClicked = req.params.playlistId;
  console.log(loggedInUserId);

    var dbConnection = mysql.createConnection(dbConnectionInfo);
    dbConnection.connect();

    dbConnection.on('error', function(err) {
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
            console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
        } else {
            console.log('Got a DB Error: ', err);
        }
    });

    dbConnection.query('SELECT * FROM audioLinks WHERE audioLinks_playlistId=?',[playlistId], function(err, results, fields) {
        if (err) {
            throw err;
        }


        var audioInPlaylists = new Array();

        for (var i = 0; i < results.length; i++) {
            var audioClip = {};
            audioClip.id = results[i].audioId;
            audioClip.name = results[i].audioName;
            audioClip.url = results[i].url;
            audioClip.playlistId = results[i].audioLinks_playlistId;

           // console.log(JSON.stringify(audio));

            audioInPlaylists.push(audioClip);

        }
console.log('playlist ID showing' + playlistId)

        dbConnection.end();

        res.render('playlistPage', { audio: audioInPlaylists });
     });

    });

 });

});


router.post('/newPlaylist', function(req, res, next) {
  var dbConnection = mysql.createConnection(dbConnectionInfo);
  dbConnection.connect();
  dbConnection.on('error', function(err) {
    if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
      console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
    } else {
      console.log('Got a DB Error: ', err);
    }
  });

  var playlist = {};
  playlist.date = new Date();
  playlist.text = req.body.thePlaylist;

  //allPlaylists.push(playlist);
  
  var mysqlDate = playlist.date.toISOString().slice(0, 19).replace('T', ' ');
  dbConnection.query('INSERT INTO playlists (playlistName, date, playlistUserId) VALUES(?,?,?)',[playlist.text, mysqlDate, req.session.userId], function(err, results,fields) {
    if (err) {
      throw err;
    }
    playlist.id = results.insertId;

    console.log(JSON.stringify(playlist));
    // Close the connection and make sure you do it BEFORE you redirect
    dbConnection.end();

    res.redirect('/');
  });
    
});








router.get('/delete/:playlistId', function(req, res, next) {
  console.log("Deleting playlist " + req.params.playlistId);
  
  // I am wrapping the call to getPlaylistIndex in a if(req.params.id) condition
  // which checks to see if I really do have a parameter called id, that is,
  // a like something like /delete/4 has been clicked as apposed to
  // /delete/
  if (req.params.playlistId) {
    var dbConnection = mysql.createConnection(dbConnectionInfo);
    dbConnection.connect();
    dbConnection.on('error', function(err) {
      if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
        console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
      } else {
        console.log('Got a DB Error: ', err);
      }
    });

    dbConnection.query('DELETE FROM playlists WHERE playlistId=?',[req.params.playlistId], function(err,results, fields) {
      if (err) {
        console.log("Error deleting playlist");
        throw err;
      }
       
       console.log("Playlist deleted");
       dbConnection.end();
       res.redirect('/');
    });
  }

});

router.get('/edit', function(req, res, next) {
  console.log("Editing playlist " + req.query.id);
  
  if (req.query.id) {
    var dbConnection = mysql.createConnection(dbConnectionInfo);
    dbConnection.connect();
    dbConnection.on('error', function(err) {
      if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
        console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
      } else {
        console.log('Got a DB Error: ', err);
      }
    });

    dbConnection.query('SELECT * FROM playlists WHERE playlistId=?',[req.query.id], function(err, results, fields){

      if (err) {
        throw err;
      }

      if (results.length == 1) {
        var aPlaylist = {};
        aPlaylist.id = results[0].playlistId;
        aPlaylist.text = results[0].playlistName;
        aPlaylist.date = new Date(results[0].date);
        
        dbConnection.end();

        res.render('playlistForm', {playlist: aPlaylist});
      } else {

        dbConnection.end();
        res.redirect('/');
      }


    });

  }
  
});

router.post('/editPlaylist', function(req, res, next) {
  var dbConnection = mysql.createConnection(dbConnectionInfo);
  dbConnection.connect();
  dbConnection.on('error', function(err) {
    if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
      console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
    } else {
      console.log('Got a DB Error: ', err);
    }
  });

  var playlist = {};
  playlist.id = req.body.id;
  playlist.date = new Date();
  playlist.text = req.body.thePlaylist;
    
  var mysqlDate = playlist.date.toISOString().slice(0, 19).replace('T', ' ');
  
  dbConnection.query('UPDATE playlists SET text=?, date=? WHERE playlistId=? AND playlistUserId=?',[playlist.playlistName, mysqlDate, playlist.id, req.session.userId], function(err, results,fields) {
    if (err) {
      throw err;
    }

    dbConnection.end();

    res.redirect('/');
  });


});

router.post('/newAudio', function(req, res, next) {
  var dbConnection = mysql.createConnection(dbConnectionInfo);
  dbConnection.connect();
  dbConnection.on('error', function(err) {
    if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
      console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
    } else {
      console.log('Got a DB Error: ', err);
    }
  });

  var audio = {};
  audio.name = req.body.theAudio;
  audio.url = req.body.theAudioUrl;
  audio.playlistId = playlistClicked;
  //req.params.playlistId = playlistClicked;

  console.log('----------------'+ req.params.playlistId + '-----------------------');
  
  dbConnection.query('INSERT INTO audioLinks (AudioName, url, audioLinks_playlistId) VALUES(?,?,?)',[audio.name, audio.url, audio.playlistId], function(err, results,fields) {
    if (err) {
      throw err;
    }
    audio.id = results.insertId;

    console.log(JSON.stringify(audio));
    // Close the connection and make sure you do it BEFORE you redirect
    dbConnection.end();

    res.redirect('/playlist'+playlistId);
  });
    
});




module.exports = router;