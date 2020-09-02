import * as Modes from "../modes";
import QuadTreeUtil from "../helper/quadtree.js";
import Manager from "../helper/Manager.js";
import Player from "./Player.js";

class Room {
	constructor({
		_io,
		id,
		master,
		text,
		maxPlayer,
		mode,
		timeCreate = Date.now(),
		gameOption = {}
	}) {
		this._io = _io;
		this.id = id;
		this.master = master;
		this.text = text;
		this.maxPlayer = maxPlayer;
		this.mode = mode;
		this.timeCreate = timeCreate;
		this.playerManager = new Manager();

		this.game = new Modes[mode](Object.assign({
			_io,
			id,
			maxPlayer,
		}, gameOption));
	}

	destroy() {
		for (const player of this.playerManager.items) {
			player._io.leave(this.id);
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
			if (this.playerManager.find({
				id: socket.id
			})) {
				return reject("Bạn đã join phòng khác!");
			}
			if (this.playerManager.getLength() < this.maxPlayer) {
				socket.join(this.id, () => {
					const player = this.playerManager.add(new Player({
						_socket: socket,
						id: socket.id,
						name: socket.name || "idk"
					}));
					this.game.addPlayer(player);
					resolve(player);
				});
			} else {
				reject("Phòng đã đủ người chơi :))");
			}
		});
	}

	disconnectSocket(socket) {
		this.playerManager.delete(this.playerManager.find({
			id: socket.id
		}));
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

		this._io.emit("room chat", {
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
}

export default Room;
