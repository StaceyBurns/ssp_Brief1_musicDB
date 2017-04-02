var express = require('express');
var mysql = require('mysql');

var router = express.Router();

var dbConnectionInfo = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'SSP'
};

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

router.get('/admin/playlist:playlistId', function(req, res, next) {
  playlistId = req.params.playlistId;
  

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
console.log(results[1].url);
        dbConnection.end();

        res.render('playlistPage', { audio: audioInPlaylists });
     });

    });

 });

});










module.exports = router;