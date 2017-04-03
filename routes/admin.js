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



router.post('/login', function(req, res, next) {
    var username = req.body.username;

    username = username.trim();

    if (username.length == 0) {
        res.redirect('/login');
    } else {
        req.session.username = username;
        res.redirect('/');
    }
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

    dbConnection.query('SELECT * FROM playlists', function(err, results, fields) {
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
  
  var mysqlDate = playlist.date.toISOString().slice(0, 19).replace('T', ' ');
  dbConnection.query('INSERT INTO playlists (playlistName, date) VALUES(?,?)',[playlist.text, mysqlDate], function(err, results,fields) {
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
  
  dbConnection.query('UPDATE playlists SET text=?, date=? WHERE playlistId=?',[playlist.playlistName, mysqlDate, playlist.id], function(err, results,fields) {
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

    res.redirect('/playlist:playlistId');
  });
    
});




module.exports = router;