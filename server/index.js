import http from "http";
import express from "express";
import sio from "socket.io";
import cors from "cors";
import session from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import GameServer from "./game/main.js";
import router from "./router/router.js";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const io = sio(server);

server.listen(port, function() {
	console.log("listening on *:" + port);
});

// ===========================

app.use(cors({
	credentials: true
}));
app.use(express.static(__dirname + "/assets"));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(session({
	secret: "secret",
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

for (const url in router) {
	app.use(url, router[url]);
}

// start server
const gameServer = new GameServer(io);

export {
	app,
	gameServer
};
