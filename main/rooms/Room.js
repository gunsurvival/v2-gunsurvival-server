const uniqid = require('uniqid');
const {Manager} = require('../helpers');

module.exports = class Room extends Manager {
	constructor({
		gameServer,
		id = uniqid(),
		master,
		description = 'New Game!',
		maxPlayer = 1,
		password = '',
		timeCreate = Date.now()
	}) {
		super();
		this.gameServer = gameServer;
		this.id = id;
		this.master = master;
		this.description = description;
		this.maxPlayer = maxPlayer;
		this.password = password;
		this.timeCreate = timeCreate;
		this.socketIDs = [];
		this.onMessageHandlers = {
			'room-leave': async socket => {
				try {
					await this.onLeave(socket, true);
					this.onAnyLeave(socket);
				} catch (e) {
					socket.emit('error', e.message);
				}
			}
		};
		this.updateInterval;
		this.onCreate();
	}

	emit(eventName, ...args) {
		this.gameServer.io.to(this.id).emit(eventName, ...args);
	}

	getMetadata() {
		return {
			id: this.id,
			master: this.master,
			description: this.description,
			maxPlayer: this.maxPlayer,
			playing: this.socketIDs,
			timeCreate: this.timeCreate
		};
	}

	async requestJoin(socket, options) {
		if (this.find({id: socket.id}))
			throw new Error('Bạn đã tham gia phòng này rồi!');
		if (this.socketIDs.length >= this.maxPlayer) {
			if (this.id.includes('lobby'))
				throw new Error('Sảnh chờ quá tải, hãy thử tải lại trang!');
			throw new Error('Phòng đã đủ số lượng người chơi!');
		}
		await this.onJoin(socket, options);
		socket.join(this.id);
		this.socketIDs.push(socket.id);
	}

	onMessage(eventName, cb) {
		this.onMessageHandlers[eventName] = cb;
		// returns a method to unbind the callback
		return () => delete this.onMessageHandlers[eventName];
	}

	onAnyLeave(socket) {
		// consented and not consented
		this.emit('room-leave', socket.id);
		socket.leave(this.id);
		const index = this.socketIDs.indexOf(socket.id);
		index != -1 && this.socketIDs.splice(index, 1);
		if (this.socketIDs.length <= 0) this.destroy();
	}

	async onCreate() {}

	async onJoin(socket, options) {}

	async onLeave(socket, consented) {}

	async onDispose() {}

	start() {
		this.updateInterval = setInterval(() => {
			for (let i = 0; i < this.items.length; i++) {
				const sprite = this.items[i];
				const res = this.items
					.map(x => x.getMetadata())
					.filter(
						e =>
							Math.sqrt(
								Math.pow(e.pos.x - sprite.pos.x, 2) +
									Math.pow(e.pos.y - sprite.pos.y, 2)
							) <= 400
					);
				sprite.emit('world', res);
				// console.log(res[0]);
			}
		}, 1000 / GAME_CONFIG.TICKRATE);
	}

	nextTick() {
		for (let i = 0; i < this.items.length; i++) {
			const sprite = this.items[i];
			sprite.nextTick();
			sprite.tick++;
		}
	}

	destroy() {
		clearInterval(this.updateInterval);
		for (let i = 0; i < this.socketIDs.length; i++) {
			const found = this.items[i].find({id: this.socketIDs[i]});
			if (found) found.socket.leave(this.id);
		}
		this.deleted = true;
	}
};
