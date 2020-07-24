import xssFilters from "xss-filters";
import uniqid from "uniqid";
import {
	RoomManager
} from "./room.js";

class GameServer {
	constructor(_emitter) {
		this._emitter = _emitter;
		this.roomManager = new RoomManager(this._emitter); // _emitter is "io"

		this._emitter.on("connection", socket => {

			socket.on("room create", ({
				text,
				maxPlayer,
				mode
			} = {}) => {
				const validMode = ["Creative", "King"];

				if (this.roomManager.getRoomBySocket(socket) || validMode.indexOf(mode) == -1)
					return socket.emit("dialog alert", "Loi! Vui long thu lai sau . . .");

				if (maxPlayer < 5 || maxPlayer > 15 || isNaN(maxPlayer)) {
					return socket.emit("dialog alert", "hack cc");
				}

				text = xssFilters.inHTMLData(text);

				const room = this.roomManager.add({ // lỗi ở server thôi
					id: uniqid(), // id cua phong
					text, // dong thong diep
					master: socket.id, // chu phong
					maxPlayer, // so luong choi choi
					mode // game mode
				});

				room.game.start();
				this._emitter.emit("room create", room.getData());
				socket.emit("room created", room.id);
			});

			socket.on("disconnect", () => {
				console.log(`1 player disconnected, online: ${this.getOnline()}`);
				this._emitter.emit("online", this.getOnline());

				let room = this.roomManager.getRoomBySocket(socket);
				if (!room) return;

				room.socketDisconnect(socket);

				if (room.playing.length <= 0) { // nếu ko có ai trong phòng thì xóa phòng
					this.destroyRoom(room);
				} else {
					room._emitter.emit("room leave", socket.id);
					this._emitter.emit("room update", room.getData());
				}
			});

			socket.on("pingms", time => {
				socket.emit("pingms", time);
			});

			socket.on("gunner degree", (degree) => {
				let room = this.roomManager.getRoomBySocket(socket);
				if (!room || isNaN(degree)) return;

				socket.gunner.degree = degree;
			});

			socket.on("keydown", key => {
				let room = this.roomManager.getRoomBySocket(socket);
				if (!room) return;
				// console.log(key.toLowerCase());
				socket.gunner.onKeyDown(key.toLowerCase());
			});

			socket.on("keyup", key => {
				let room = this.roomManager.getRoomBySocket(socket);
				if (!room) return;

				socket.gunner.onKeyUp(key.toLowerCase());
			});

			socket.on("mouseDown", () => {
				let room = this.roomManager.getRoomBySocket(socket);
				if (!room) return;
				socket.gunner.onMouseDown("left");
			});

			socket.on("mouseUp", () => {
				let room = this.roomManager.getRoomBySocket(socket);
				if (!room) return;
				socket.gunner.onMouseUp("left");
			});

			socket.on("rooms update", () => {
				socket.emit("rooms update", this.getAllRoomData());
			});

			socket.on("weapon change", index => {
				let room = this.roomManager.getRoomBySocket(socket);
				if (!room) return;

				let bag = socket.gunner.bag;
				if (index == bag.index)
					return;
				if (index <= bag.arr.length - 1 && index >= 0) {
					bag.index = index;
					bag.arr[bag.index].take();
				}

				room._emitter.emit("weapon change", {
					id: socket.id,
					gun: bag.arr[bag.index]
				});
			});

			socket.on("name", name => {
				if (name.length <= 30) {
					name = xssFilters.inHTMLData(name);
					socket.name = name;
				}
			});

			socket.on("room chat", text => {
				let room = this.roomManager.getRoomBySocket(socket);
				if (!room) return;

				if (text.length > 100)
					return;
				text = xssFilters.inHTMLData(text);
				room.addChat(text, socket);
			});

			socket.on("room join", (id) => {
				if (this.roomManager.getRoomBySocket(socket)) return; // neu da join roi thi huy bo
				let room = this.roomManager.find(id, true);
				if (!room) // khong tim thay phong
					return socket.emit("dialog alert", "Room not found!");

				room.socketJoin(socket).then(() => {
					this._emitter.emit("room update", room.getData()); // update room table
				}).catch(message => {
					socket.emit("dialog alert", message);
				});
			});

			socket.on("room leave", () => {
				this._emitter.emit("online", this.getOnline());
				let room = this.roomManager.getRoomBySocket(socket);
				if (!room) return;

				room.socketDisconnect(socket);
				if (room.playing.length <= 0) { // nếu ko có ai trong phòng thì xóa phòng
					this.destroyRoom(room);
				} else {
					room._emitter.emit("room leave", socket.id);
					this._emitter.emit("room update", room.getData());
				}
			});
		});
	}

	getAllRoomData() {
		const roomSettings = [];
		for (let room of this.roomManager.items)
			roomSettings.push(room.getData());
		return roomSettings;
	}

	destroyRoom(room) {
		this._emitter.emit("room delete", room.id);
		room.destroy();
		this.roomManager.delete(room);
	}

	getOnline() {
		return this._emitter.engine.clientsCount;
	}
}

export default GameServer;
