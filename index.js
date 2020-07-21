const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const xssFilters = require("xss-filters");
const port = process.env.PORT || 3000;

const { Creative, King } = require("./js/modes.js");

let listImages = [];
let rooms = [];
let roomIDJoined = {}; // check id room of stranger
let roomIDTick = 10000;

const getRoom = function(socket) {
	let roomID = roomIDJoined[socket.id]; // checking if user do join a room
	if (!roomID) {
		return;
	}
	let roomIndex = rooms.findIndex(e => e.setting.id == roomID);
	if (roomIndex == -1) { // checking exist of room join id
		return;
	}
	return rooms[roomIndex];
};

app.use(cors());
app.use(express.static(__dirname + "/assets"));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(session({
	secret: "secret",
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.send("Apache is functioning normally<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>đùa thôi :v server nodejs mà ;))");
});

app.get("/list-images", (req, res) => {
	res.send(listImages);
});

app.post("/mapeditor", function(req, res) {
	let mapJSON;
	if (typeof req.body.map == "string") {
		try {
			mapJSON = JSON.parse(req.body.map);
			res.send({
				icon: "error",
				title: ":(",
				text: "ko đọc đc map"
			});
			console.log(mapJSON);
		} catch (e) {
			res.send({
				icon: "success",
				title: "K",
				text: "ok"
			});
		}
	}
});

io.on("connection", function(socket) {
	io.emit("online", io.engine.clientsCount);

	socket.name = socket.id;

	socket.on("name", name => {
		if (name.length <= 30) {
			name = xssFilters.inHTMLData(name);
			socket.name = name;
		}
	});

	socket.on("room chat", text => {
		let room = getRoom(socket);
		if (!room) return;

		if (text.length > 100)
			return;
		text = xssFilters.inHTMLData(text);
		room.addChat(text, socket);
	});

	socket.on("room create", ({ text, maxPlayer, mode } = {}) => {
		let validMode = ["Creative", "King"];

		if (getRoom(socket) || validMode.indexOf(mode) == -1)
			return;

		if (maxPlayer < 5 || maxPlayer > 15 || isNaN(maxPlayer)) {
			socket.emit("dialog alert", "hack cc");
			return;
		}

		text = xssFilters.inHTMLData(text);

		let Modes = {
			Creative,
			King
		};

		rooms.push(new Modes[mode]({ // lỗi ở server thôi
			id: roomIDTick++, // id cua phong
			text, // dong thong diep
			master: socket.id, // chu phong
			maxPlayer, // so luong choi choi
			io // server cua game
		}));

		let room = rooms[rooms.length - 1];
		room.start(); // start the interval

		io.emit("room create", room.setting);
		socket.emit("room created", room.setting.id);
	});

	socket.on("room respawn", () => {
		let room = getRoom(socket);
		if (!room) return;
		// let { setting, map, gunners } = room;
		// let indexG = gunners.findIndex(e => e.id == socket.id);
		// if (indexG == -1)
		//     return;
		// let gunner = gunners[indexG];
		// if (!gunner.dead)
		//     return;
		// gunner.dead = false;
		// gunner.blood = 100;
		// gunner.holdingCoolDown = 0;
		// gunner.pos.x = random.int(-WORLDSIZE.width / 2, WORLDSIZE.width / 2);
		// gunner.pos.y = random.int(-WORLDSIZE.height / 2, WORLDSIZE.height / 2);
		// gunner.move.up = false;
		// gunner.move.down = false;
		// gunner.move.left = false;
		// gunner.move.right = false;
		// delete gunner.keydown;
		// gunner.keydown = {};
		// gunner.firing = false;
		// shuffle(allWeapons);
		// clearArray(gunner.bag.arr, 2);
		// gunner.bag.arr = [{ ...allWeapons[0] }, { ...allWeapons[1] }];
		// gunner.bag.index = 0;
		// io.to(socket.id).emit("room respawn private", gunner.bag);
		// io.to(setting.id).emit("room respawn public", socket.id, gunner.bag.arr[gunner.bag.index]);
		// addWorker(socket);
	});

	socket.on("room join", (joinRoomID) => {
		if (getRoom(socket)) return; // neu da join roi thi huy bo

		let indexRoom = rooms.findIndex(e => e.id == joinRoomID);
		if (indexRoom == -1) // khong tim thay phong
			return socket.emit("Room not found!");

		let room = rooms[indexRoom];

		room.join(socket).then(() => {
			roomIDJoined[socket.id] = joinRoomID;
			io.emit("room update", room.setting); // update room table
		}).catch(message => {
			console.log(message);
			socket.emit("dialog alert", message);
		});
	});

	socket.on("room leave", () => {
		io.emit("online", io.engine.clientsCount);
		let room = getRoom(socket);
		if (!room) return;
		let { setting } = room;
		room.disconnect(socket).then(() => {
			if (setting.playing.length <= 0) { // nếu ko có ai trong phòng thì xóa phòng
				room.destroy();
				io.emit("room delete", room.setting.id);
				rooms.splice(rooms.findIndex(e => e.setting.id == room.setting.id), 1);
			}

			delete roomIDJoined[socket.id]; // xóa room id người đó
			delete socket.gunner; // xóa room id người đó
			io.to(setting.id).emit("room leave", socket.id);
			io.emit("room update", setting);
		}).catch(() => {
			socket.emit("dialog alert", "bad request!");
		});
	});

	//---------------------------------------------

	socket.on("disconnect", () => {
		console.log("1 player disconnected, online: " + io.engine.clientsCount);
		io.emit("online", io.engine.clientsCount);
		let room = getRoom(socket);
		if (!room) return;
		let { setting } = room;
		room.disconnect(socket).then(() => {
			if (setting.playing.length <= 0) { // nếu ko có ai trong phòng thì xóa phòng
				room.destroy();
				io.emit("room delete", setting.id);
				rooms.splice(rooms.findIndex(e => e.setting.id == setting.id), 1);
			}

			delete roomIDJoined[socket.id]; // xóa room id người đó
			delete socket.gunner; // xóa room id người đó
			io.to(setting.id).emit("room leave", socket.id);
			io.emit("room update", setting);
		}).catch(() => {
			socket.emit("dialog alert", "bad request!");
		});
	});

	socket.on("gunner degree", (degree) => {
		let room = getRoom(socket);
		if (!room) return;
		if (!isNaN(degree))
			socket.gunner.degree = degree;
	});

	socket.on("pingms", time => {
		socket.emit("pingms", time);
	});

	socket.on("keydown", key => {
		let room = getRoom(socket);
		if (!room) return;
		console.log(key.toLowerCase());
		socket.gunner.onKeyDown(key.toLowerCase());
	});

	socket.on("keyup", key => {
		let room = getRoom(socket);
		if (!room) return;

		socket.gunner.onKeyUp(key.toLowerCase());
	});

	socket.on("mouseDown", () => {
		let room = getRoom(socket);
		if (!room) return;
		socket.gunner.onMouseDown("left");
	});

	socket.on("mouseUp", () => {
		let room = getRoom(socket);
		if (!room) return;
		socket.gunner.onMouseUp("left");
	});

	socket.on("rooms update", () => {
		let roomSettings = [];
		for (let room of rooms)
			roomSettings.push(room.setting);
		socket.emit("rooms update", roomSettings);
	});

	socket.on("weapon change", index => {
		let room = getRoom(socket);
		if (!room) return;

		let bag = socket.gunner.bag;
		if (index == bag.index)
			return;
		if (index <= bag.arr.length - 1 && index >= 0) {
			bag.index = index;
			bag.arr[bag.index].take();
		}

		io.emit("weapon change", {
			id: socket.id,
			gun: bag.arr[bag.index]
		});
	});
});

http.listen(port, function() {
	console.log("listening on *:" + port);
	fs.readdir(path.join(__dirname, "assets/img"), function(err, files) {
		if (err) {
			return console.log("Unable to scan directory: " + err);
		}
		files.forEach(function(file) {
			if (/^(.*)-min\.png$/.test(file))
				listImages.push(file);
		});
	});
});
