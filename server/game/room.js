import {
	QuadTreeUtil
} from "./utils.js";
import {
	Creative,
	King
} from "./modes.js";

class Manager {
	constructor(_emitter) {
		this._emitter = _emitter;
		this.items = [];
	}

	delete(item) {
		const index = this.items.indexOf(item);
		this.items.splice(index, 1);
	}

	top() {
		return this.items[0];
	}

	bottom() {
		return this.items[this.items.length - 1];
	}
}

class RoomManager extends Manager {
	constructor(_emitter) {
		super(_emitter);
	}

	add(config, duplicateCheck = true) {
		const index = this.find(config.id);

		if (index != -1 && duplicateCheck) {
			return this.items[index];
		}

		config._emitter = this._emitter.to(config.id);
		this.items.push(new Room(config));
		return this.bottom();
	}

	find(id, returnRoom = false) {
		const index = this.items.findIndex(e => e.id == id);
		if (returnRoom)
			return this.items[index];
		return index;
	}

	getRoomBySocket(socket) {
		if (!socket.roomId) { // checking if user do join a room
			return false;
		}
		return this.find(socket.roomId, true);
	}
}

class Room {
	constructor({
		id,
		text,
		master,
		maxPlayer,
		mode,
		_emitter,
		playing = [],
		timeCreate = Date.now()
	}) {
		this._emitter = _emitter;
		this.id = id;
		this.master = master;
		this.text = text;
		this.maxPlayer = maxPlayer;
		this.playing = playing;
		this.timeCreate = timeCreate;
		this.socketManager = new SocketManager();

		const Modes = {
			Creative,
			King
		};
		this.game = new Modes[mode]({
			maxPlayer: this.maxPlayer,
			_emitter: this._emitter
		});
	}

	destroy() {
		for (const socket of this.socketManager.items) {
			socket.leave(this.id);
		}
		this.game.destroy();
	}

	getData() {
		return {
			id: this.id,
			master: this.master,
			text: this.text,
			maxPlayer: this.maxPlayer,
			playing: this.playing,
			timeCreate: this.timeCreate
		};
	}

	socketJoin(socket) { // kiem tra cac dieu dien de vao room
		return new Promise((resolve, reject) => {
			if (this.playing.length < this.maxPlayer) {
				socket.join(this.id, () => {
					socket.roomId = this.id;
					this.socketManager.add(socket);
					this.playing.push(socket.id);
					socket.gunner = this.game.addPlayer(socket); // tao player theo mode xong thi add vao activeObjects

					this._emitter.emit("toast alert", `${socket.name} đã vào phòng!`);
					socket.emit("static objects", this.game.staticObjects);
					resolve();
				});
			} else {
				reject("Phòng đã đủ người chơi :))");
			}
		});
	}

	socketDisconnect(socket) {
		this.playing.splice(this.playing.indexOf(socket.id), 1); // xóa player trong playing
		this.socketManager.delete(socket);
		// let index = this.activeObjects.gunners.findIndex(e => e.id == socket.gunner.id);
		// this.activeObjects.gunners.splice(index, 1);
		// if (index != -1)
		//     resolve();
		// else
		//     reject();
		// cai tren cho Mode.delete(); (this.game)
	}

	addChat(text, socket, checkSpam = true) {
		if (checkSpam) {
			if (text.length == 0 || text.length > 50 || Date.now() - socket.lastChat < 1000)
				return;
		}

		this._emitter.emit("room chat", {
			id: socket.id,
			text
		});

		socket.lastChat = Date.now();

		if (!socket.isBot) { // if socket !isBot then message to other bots
			let range = new QuadTreeUtil.Circle(socket.gunner.pos.x, socket.gunner.pos.y, 500);
			let points = this.game.activeQtree.query(range);
			for (let point of points) {
				let {
					userData: pointData
				} = point;
				if (pointData.copy.isBot) {
					let {
						degree,
						pos
					} = socket.gunner;
					let radianMe = degree * Math.PI / 180;
					let vt1 = {
						x: Math.cos(radianMe),
						y: Math.sin(radianMe)
					};
					let mag1 = Math.sqrt(Math.pow(vt1.x, 2) + Math.pow(vt1.y, 2));
					let radianMeBot = Math.atan2(pointData.origin.pos.y - pos.y, pointData.origin.pos.x - pos.x);
					let vt2 = {
						x: Math.cos(radianMeBot),
						y: Math.sin(radianMeBot)
					};
					let mag2 = Math.sqrt(Math.pow(vt2.x, 2) + Math.pow(vt2.y, 2));
					let angleBetween = (Math.acos(vt1.x * vt2.x + vt1.y * vt2.y) / (mag1 * mag2));
					if (angleBetween * 180 / Math.PI < 30)
						pointData.origin.reply(text, this);
				}
			}
		}
	}

	getSocketById(id) {
		return this.socketManager.find(id, true);
	}
}

class SocketManager extends Manager {
	constructor(_emitter) {
		super(_emitter);
	}

	add(socket, duplicateCheck = true) {
		const index = this.find(socket.id);

		if (index != -1 && duplicateCheck) {
			return this.items[index];
		}

		this.items.push(socket);
		return this.bottom();
	}

	find(id, returnSocket = false) {
		const index = this.items.findIndex(e => e.id == id);
		if (returnSocket)
			return this.items[index];
		return index;
	}
}

export {
	RoomManager,
	Room,
	SocketManager
};
