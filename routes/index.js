var express = require('express');
var mysql = require('mysql');

var router = express.Router();

var playlistClicked = '';

var dbConnectionInfo = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'SSP'
};
