import http from "http";
import express from "express";
import sio from "socket.io";
import cors from "cors";
import logger from "node-color-log";
import session from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import router from "./router";
import GameServer from "./game";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const io = sio(server);

// ===========================

app.use(
	cors({
		credentials: true
	})
);
app.use(express.static(__dirname + "/assets"));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(
	session({
		secret: "secret",
		resave: true,
		saveUninitialized: true
	})
);
app.use(
	bodyParser.urlencoded({
		extended: false
	})
);
app.use(bodyParser.json());

for (const url in router) {
	app.use(url, router[url]);
}

server.listen(port, function() {
	logger.info("App started!");
	// start server
	new GameServer(io);
});

export default app;
