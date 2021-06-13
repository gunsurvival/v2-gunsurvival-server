const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {Server} = require('socket.io');
const app = express();
const httpServer = app.listen(3000);
const io = new Server(httpServer);
const GameServer = require('./GameServer');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

global.GAME_CONFIG = require('./config/gameConfig');
new GameServer(io);

module.exports = app;
