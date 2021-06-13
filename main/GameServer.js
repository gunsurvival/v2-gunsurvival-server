const Room = require('./rooms');

module.exports = class GameServer {
	constructor(io) {
		this.io = io;
		this.rooms = {};
		this.tps = 0;

		io.on('connection', async socket => {
			console.log('connect: ' + socket.id);

			socket.onAny((eventName, ...args) => {
				socket.adapter.rooms.forEach((key, roomID) => {
					if (roomID == socket.id) return;
					const cb = this.rooms[roomID]?.onMessageHandlers[eventName];
					try {
						if (cb) cb(socket, ...args);
					} catch (e) {
						console.log(e);
					}
				});
			});

			socket.on('lobby-join', async () => {
				// const lobbyID = 'lobby' + socket.id;
				const lobbyID = 'lobby';

				if (!this.rooms[lobbyID])
					this.rooms[lobbyID] = new Room.Lobby({
						gameServer: this,
						id: lobbyID,
						master: socket.id,
						description: 'My lobby',
						maxPlayer: 5
					});
				const myLobby = this.rooms[lobbyID];

				try {
					await myLobby.requestJoin(socket);
					socket.emit('lobby-join');
				} catch {
					socket.emit('error', 'Lỗi!');
					return;
				}
			});

			socket.on('disconnect', () => {
				socket.adapter.rooms.forEach(async (key, roomID) => {
					if (this.rooms[roomID]) {
						await this.rooms[roomID].onLeave(socket, false);
						this.rooms[roomID].onAnyLeave(socket);
					}
				});
			});
		});

		let tick = 0;

		this.simulateInterval = setInterval(() => {
			const timeNow = Date.now();
			for (let id in this.rooms) {
				this.rooms[id].nextTick();
				this.rooms[id].performance = Date.now() - timeNow;
			}
			tick++;
		});

		this.balanceTPSInterval = setInterval(() => {
			const div = Math.abs(tick - this.tps);
			console.log(tick);
			if (tick - this.tps > this.tps / 10) this.tps += Math.round(div / 5);
			if (this.tps - tick > this.tps / 10) this.tps -= Math.round(div / 5);
			tick = 0;
		}, 1000);
	}

	emit(eventName, ...args) {
		this.io.emit(eventName, ...args);
	}

	async createRoom(socket, options) {
		let mode;
		for (const key in Room) {
			if (key.toLowerCase() == options.mode) {
				mode = key;
				break;
			}
		}
		if (!mode) throw new Error('Lỗi');
		const room = new Room[mode](
			{
				gameServer: this,
				master: socket.id
			},
			...options
		);
		this.rooms[room.id] = room;
	}
};
