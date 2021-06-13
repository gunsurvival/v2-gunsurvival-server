const Room = require('./Room');
const Sprite = require('../sprites');

module.exports = class Lobby extends Room {
	constructor(options) {
		super(options);
	}

	async onCreate(options) {
		this.onMessage('change-name', (socket, data) => {
			// console.log('bruh2');
		});

		this.onMessage('room-join', async (socket, roomID) => {
			try {
				await this.rooms[roomID].requestJoin(socket);
				socket.leave(socket.data.currentLobby);
			} catch {
				socket.emit('error', 'Lỗi!');
			}
		});

		this.onMessage('room-create', async (socket, options) => {
			try {
				await this.gameServer.createRoom(socket, options);
			} catch (e) {
				socket.emit('error', e.message);
			}
		});

		this.onMessage('moving', (socket, moving = {}) => {
			const player = socket.data.player;
			if (!player) return;
			if (moving.up === true) player.moving.up = true;
			if (moving.down === true) player.moving.down = true;
			if (moving.left === true) player.moving.left = true;
			if (moving.right === true) player.moving.right = true;

			if (moving.up === false) player.moving.up = false;
			if (moving.down === false) player.moving.down = false;
			if (moving.left === false) player.moving.left = false;
			if (moving.right === false) player.moving.right = false;
		});

		this.onMessage('rotate', (socket, angle = 0) => {
			const player = socket.data.player;
			if (!player) return;
			player.angle = angle;
		});
	}

	async onJoin(socket) {
		socket.data.currentLobby = this.id;
		const player = this.add(
			new Sprite.Gunner({
				room: this,
				id: socket.id
			})
		);
		socket.data.player = player;
		this.start();
	}

	async onLeave(socket, consented) {
		if (!consented) return this.delete({id: socket.id});
		if (socket.data.currentLobby != 'lobby' + socket.id) {
			this.delete({id: socket.id});
			await this.rooms['lobby' + socket.id].requestJoin(socket);
		} else {
			throw new Error('Bạn không thể thoát lobby của chính mình!');
		}
	}
};
