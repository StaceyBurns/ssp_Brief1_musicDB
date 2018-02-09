var express = require('express');
var mysql = require('mysql');

var router = express.Router();


var pool = mysql.createPool({
    connectionLimit: 100,
    host: 'mysql3792.cp.blacknight.com',
    user: 'u1432648_stacey1',
    password: 'v3J9Yp4L',
    database: 'db1432648_playlistBuilder'
});

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

    member.id = req.body.id;
    member.name = req.body.newFname;
    member.email = req.body.newUsername;
    member.pword = req.body.newPassword;

    pool.getConnection(function(err, connection) {
        connection.query('SELECT email FROM users', function(err, results, fields) {
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
            pool.getConnection(function(err, connection) {
                connection.query('INSERT INTO users (email, pword, fName) VALUES(?,?,?)', [member.email, member.pword, member.name], function(err, results, fields) {
                    if (err) {
                        throw err;
                    }
                    member.id = results.insertId;
                    console.log(JSON.stringify(member));
                    req.session.email = member.email;
                    req.session.name = member.name;
                    connection.release();

                    res.redirect('/login');

                });
            });
        });
    });
});


router.post('/login', function(req, res, next) {
    var userMessage = req.session.userMessage ? req.session.userMessage : "";
    req.session.userMessage = "";

    member.email = req.body.username;

    pool.getConnection(function(err, connection) {
        connection.query('SELECT email, pword, userId FROM users WHERE email=?', [member.email], function(err, results, fields) {
            if (err) {
                throw err;
            } else if (results.length) {
                console.log('The result is  ', results[0].email);
                member.userId = results[0].userId;
                req.session.email = results[0].email;
                req.session.userId = results[0].userId;
            } else {
                console.log("Query didn't return any results.");
                req.session.userMessage = "This email address is not registered";
            }


            var givenUsername = req.body.username;
            var givenPassword = req.body.password;
            console.log(JSON.stringify(member));
            connection.release();
            if (results.length == 0) {
                res.render('login', {
                    msg: userMessage
                });
            } else if (givenPassword != results[0].pword) {
                console.log("wrong password")
                req.session.userMessage = "Password/email incorrect";
                res.render('login', {
                    msg: userMessage
                });
            } else {
                res.redirect('/')
                req.session.username = member.email;
            }
            console.log('The session ID is ' + req.session.userID);
        });
    });
});




router.get('/', function(req, res, next) {

    pool.getConnection(function(err, connection) {

        connection.on('error', function(err) {
            if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
                console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
            } else {
                console.log('Got a DB Error: ', err);
            }
        });

        connection.query('SELECT * FROM playlists where playlistUserId=?', [req.session.userId], function(err, results, fields) {
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

            connection.release();

            res.render('playlistList', {
                playlists: allPlaylists
            });
        });

        router.get('/playlist:playlistId', function(req, res, next) {
            playlistId = req.params.playlistId;
            playlistClicked = req.params.playlistId;
            console.log(loggedInUserId);

            pool.getConnection(function(err, connection) {

                connection.on('error', function(err) {
                    if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
                        console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
                    } else {
                        console.log('Got a DB Error: ', err);
                    }
                });

                connection.query('SELECT * FROM audioLinks WHERE audioLinks_playlistId=?', [playlistId], function(err, results, fields) {
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

                        audioInPlaylists.push(audioClip);

                    }
                    console.log('playlist ID showing' + playlistId)

                    connection.release();

                    pool.getConnection(function(err, connection) {

                        connection.on('error', function(err) {
                            if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
                                console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
                            } else {
                                console.log('Got a DB Error: ', err);
                            }
                        });

                        connection.query('SELECT playlistName FROM playlists WHERE playlistId=?', [req.params.playlistId], function(err, results, fields) {
                            if (err) {
                                throw err;
                            }
                            playlistName = results[0].playlistName;
                            connection.release();

                            res.render('playlistPage', {
                                audio: audioInPlaylists,
                                playlist: playlistName
                            });
                        });

                    });

                });

            });
        });
    });
});


router.post('/newPlaylist', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.on('error', function(err) {
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
        connection.query('INSERT INTO playlists (playlistName, date, playlistUserId) VALUES(?,?,?)', [playlist.text, mysqlDate, req.session.userId], function(err, results, fields) {
            if (err) {
                throw err;
            }
            playlist.id = results.insertId;

            console.log(JSON.stringify(playlist));
            connection.release();

            res.redirect('/');
        });

    });
});




router.get('/delete/:playlistId', function(req, res, next) {
    console.log("Deleting playlist " + req.params.playlistId);

    if (req.params.playlistId) {
        pool.getConnection(function(err, connection) {

            connection.on('error', function(err) {
                if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
                    console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
                } else {
                    console.log('Got a DB Error: ', err);
                }
            });

            connection.query('DELETE FROM playlists WHERE playlistId=?', [req.params.playlistId], function(err, results, fields) {
                if (err) {
                    console.log("Error deleting playlist");
                    throw err;
                }

                console.log("Playlist deleted");
                connection.release();
                res.redirect('/');
            });

        });
    }
});

router.post('/newAudio', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.on('error', function(err) {
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

        console.log('----------------' + req.params.playlistId + '-----------------------');

        connection.query('INSERT INTO audioLinks (AudioName, url, audioLinks_playlistId) VALUES(?,?,?)', [audio.name, audio.url, audio.playlistId], function(err, results, fields) {
            if (err) {
                throw err;
            }
            audio.id = results.insertId;

            console.log(JSON.stringify(audio));
            connection.release();

            res.redirect('/playlist' + playlistId);
        });

    });
});




module.exports = router;