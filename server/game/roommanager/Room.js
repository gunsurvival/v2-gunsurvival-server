import * as Modes from "../modes";
import QuadTreeUtil from "../helper/quadtree.js";
import Manager from "../helper/Manager.js";

class Room {
	constructor({
		id,
		text,
		master,
		maxPlayer,
		mode,
		_emitter,
		timeCreate = Date.now()
	}) {
		this._emitter = _emitter;
		this.id = id;
		this.master = master;
		this.text = text;
		this.maxPlayer = maxPlayer;
		this.timeCreate = timeCreate;
		this.playerManager = new Manager(_emitter);

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
		const playing = [];
		for (const player of this.playerManager.items) {
			playing.push(player.id);
		}
		return {
			id: this.id,
			master: this.master,
			text: this.text,
			maxPlayer: this.maxPlayer,
			playing,
			timeCreate: this.timeCreate
		};
	}

	socketJoin(socket) {
		// kiem tra cac dieu dien de vao room
		return new Promise((resolve, reject) => {
			if (this.playerManager.find(socket.id) != -1)
				return reject("Bạn đã join phòng khác!");
			if (this.playerManager.getLength() < this.maxPlayer) {
				socket.join(this.id, () => {
					const player = this.playerManager.add({
						id: socket.id,
						_emitter: socket,
						name: socket.name
					});
					this.game.addPlayer(player); // convert player to Gunner Sprite in world
					this._emitter.emit(
						"toast alert",
						`${socket.name} đã vào phòng!`
					); // thông báo vào phòng
					socket.emit("static objects", this.game.staticObjects); // Gửi tọa độ các vật tĩnh
					resolve();
				});
			} else {
				reject("Phòng đã đủ người chơi :))");
			}
		});
	}

	disconnectSocket(socket) {
		this.playerManager.delete(this.playerManager.find(socket.id, true));
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
			if (
				text.length == 0 ||
				text.length > 50 ||
				Date.now() - socket.lastChat < 1000
			)
				return;
		}

		this._emitter.emit("room chat", {
			id: socket.id,
			text
		});

		socket.lastChat = Date.now();

		if (!socket.isBot) {
			// if socket !isBot then message to other bots
			let range = new QuadTreeUtil.Circle(
				socket.gunner.pos.x,
				socket.gunner.pos.y,
				500
			);
			let points = this.game.activeQtree.query(range);
			for (let point of points) {
				let {userData: pointData} = point;
				if (pointData.copy.isBot) {
					let {degree, pos} = socket.gunner;
					let radianMe = (degree * Math.PI) / 180;
					let vt1 = {
						x: Math.cos(radianMe),
						y: Math.sin(radianMe)
					};
					let mag1 = Math.sqrt(
						Math.pow(vt1.x, 2) + Math.pow(vt1.y, 2)
					);
					let radianMeBot = Math.atan2(
						pointData.origin.pos.y - pos.y,
						pointData.origin.pos.x - pos.x
					);
					let vt2 = {
						x: Math.cos(radianMeBot),
						y: Math.sin(radianMeBot)
					};
					let mag2 = Math.sqrt(
						Math.pow(vt2.x, 2) + Math.pow(vt2.y, 2)
					);
					let angleBetween =
						Math.acos(vt1.x * vt2.x + vt1.y * vt2.y) /
						(mag1 * mag2);
					if ((angleBetween * 180) / Math.PI < 30)
						pointData.origin.reply(text, this);
				}
			}
		}
	}

	getSocketById(id) {
		return this.socketManager.find(id, true);
	}
}

export default Room;
